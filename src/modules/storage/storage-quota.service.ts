import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenant/entities/tenant.entity';
import { TenantSubscription } from '../subscription/entities/tenant-subscription.entity';
import { StorageUpgrade, StorageUpgradeType, StorageUpgradeStatus } from './entities/storage-upgrade.entity';
import * as fs from 'fs';
import * as path from 'path';

// Storage limit per plan berdasarkan jumlah siswa
const STORAGE_LIMITS = {
  FREE: 10, // 0-49 siswa: 10 GB
  STANDARD: 50, // 50-500 siswa: 50 GB
  ENTERPRISE: 100, // 501+ siswa: 100 GB
};

// Paket upgrade storage
const STORAGE_UPGRADE_PACKAGES = [
  { gb: 25, price: 100000 },
  { gb: 50, price: 180000 },
  { gb: 100, price: 300000 },
  { gb: 250, price: 600000 },
];

const CUSTOM_UPGRADE_PRICE_PER_GB = 5000; // Rp 5.000 per GB per tahun
const MIN_CUSTOM_UPGRADE_GB = 10;

@Injectable()
export class StorageQuotaService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantSubscription)
    private tenantSubscriptionRepository: Repository<TenantSubscription>,
    @InjectRepository(StorageUpgrade)
    private storageUpgradeRepository: Repository<StorageUpgrade>,
  ) {}

  /**
   * Get storage limit in GB berdasarkan jumlah siswa
   */
  getStorageLimitByStudentCount(studentCount: number): number {
    if (studentCount < 50) {
      return STORAGE_LIMITS.FREE;
    } else if (studentCount <= 500) {
      return STORAGE_LIMITS.STANDARD;
    } else {
      return STORAGE_LIMITS.ENTERPRISE;
    }
  }

  /**
   * Update storage limit untuk tenant berdasarkan jumlah siswa
   */
  async updateStorageLimitForTenant(tenantId: number): Promise<void> {
    const subscription = await this.tenantSubscriptionRepository.findOne({
      where: { tenantId },
      relations: ['subscriptionPlan'],
    });

    if (!subscription) {
      return; // No subscription, skip
    }

    const baseLimitGB = this.getStorageLimitByStudentCount(subscription.currentStudentCount);
    const baseLimitBytes = baseLimitGB * 1024 * 1024 * 1024; // Convert to bytes

    // Get active upgrades
    const activeUpgrades = await this.storageUpgradeRepository.find({
      where: {
        tenantId,
        status: StorageUpgradeStatus.ACTIVE,
      },
    });

    const upgradeBytes = activeUpgrades.reduce(
      (sum, upgrade) => sum + upgrade.additionalStorageGB * 1024 * 1024 * 1024,
      0,
    );

    const totalLimitBytes = baseLimitBytes + upgradeBytes;

    await this.tenantRepository.update(tenantId, {
      storageLimitBytes: totalLimitBytes,
      storageUpgradeBytes: upgradeBytes,
    });
  }

  /**
   * Get storage quota info untuk tenant
   */
  async getStorageQuota(tenantId: number) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const subscription = await this.tenantSubscriptionRepository.findOne({
      where: { tenantId },
      relations: ['subscriptionPlan'],
    });

    const baseLimitGB = subscription
      ? this.getStorageLimitByStudentCount(subscription.currentStudentCount)
      : STORAGE_LIMITS.FREE;
    const baseLimitBytes = baseLimitGB * 1024 * 1024 * 1024;

    const usageBytes = tenant.storageUsageBytes || 0;
    const limitBytes = tenant.storageLimitBytes || baseLimitBytes;
    const upgradeBytes = tenant.storageUpgradeBytes || 0;
    const upgradeGB = upgradeBytes / (1024 * 1024 * 1024);

    const usageGB = usageBytes / (1024 * 1024 * 1024);
    const limitGB = limitBytes / (1024 * 1024 * 1024);
    const availableGB = limitGB - usageGB;
    const usagePercent = limitBytes > 0 ? (usageBytes / limitBytes) * 100 : 0;

    // Warning levels
    const isWarning = usagePercent >= 80;
    const isCritical = usagePercent >= 90;
    const isFull = usagePercent >= 100;

    return {
      usageBytes,
      limitBytes,
      usageGB: Math.round(usageGB * 100) / 100,
      limitGB: Math.round(limitGB * 100) / 100,
      availableGB: Math.round(availableGB * 100) / 100,
      usagePercent: Math.round(usagePercent * 100) / 100,
      baseLimitGB,
      upgradeGB: Math.round(upgradeGB * 100) / 100,
      isWarning,
      isCritical,
      isFull,
      canUpload: !isFull,
    };
  }

  /**
   * Check if tenant can upload file dengan size tertentu
   */
  async canUpload(tenantId: number, fileSizeBytes: number): Promise<{ allowed: boolean; reason?: string }> {
    const quota = await this.getStorageQuota(tenantId);

    if (quota.isFull) {
      return {
        allowed: false,
        reason: 'Storage quota sudah penuh. Silakan upgrade storage untuk melanjutkan upload.',
      };
    }

    const availableBytes = quota.limitBytes - quota.usageBytes;
    if (fileSizeBytes > availableBytes) {
      return {
        allowed: false,
        reason: `File terlalu besar. Sisa storage: ${quota.availableGB.toFixed(2)} GB.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Update storage usage setelah upload/delete
   */
  async updateStorageUsage(tenantId: number): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      return;
    }

    // Calculate actual storage usage dari filesystem
    const uploadPath = process.env.UPLOAD_PATH || './storage/app/public';
    const tenantStoragePath = path.join(uploadPath, 'tenants', tenantId.toString());

    let totalSize = 0;
    if (fs.existsSync(tenantStoragePath)) {
      totalSize = this.calculateDirectorySize(tenantStoragePath);
    }

    await this.tenantRepository.update(tenantId, {
      storageUsageBytes: totalSize,
    });
  }

  /**
   * Calculate directory size recursively
   */
  private calculateDirectorySize(dirPath: string): number {
    let totalSize = 0;
    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          totalSize += this.calculateDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return totalSize;
  }

  /**
   * Get available upgrade packages
   */
  getUpgradePackages() {
    return STORAGE_UPGRADE_PACKAGES.map((pkg) => ({
      ...pkg,
      pricePerGB: Math.round(pkg.price / pkg.gb),
    }));
  }

  /**
   * Calculate upgrade price
   */
  calculateUpgradePrice(
    upgradeType: StorageUpgradeType,
    additionalGB: number,
    subscriptionEndDate: Date,
  ): { pricePerYear: number; proRatedPrice: number; daysRemaining: number } {
    let pricePerYear = 0;

    if (upgradeType === StorageUpgradeType.PACKAGE) {
      const pkg = STORAGE_UPGRADE_PACKAGES.find((p) => p.gb === additionalGB);
      if (!pkg) {
        throw new BadRequestException(`Package dengan ${additionalGB} GB tidak tersedia`);
      }
      pricePerYear = pkg.price;
    } else if (upgradeType === StorageUpgradeType.CUSTOM) {
      if (additionalGB < MIN_CUSTOM_UPGRADE_GB) {
        throw new BadRequestException(`Minimal upgrade custom adalah ${MIN_CUSTOM_UPGRADE_GB} GB`);
      }
      pricePerYear = additionalGB * CUSTOM_UPGRADE_PRICE_PER_GB;
    }

    // Calculate pro-rated price
    const now = new Date();
    const endDate = new Date(subscriptionEndDate);
    const daysRemaining = Math.max(1, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const daysInYear = 365;
    const proRatedPrice = Math.round((pricePerYear * daysRemaining) / daysInYear);

    return {
      pricePerYear,
      proRatedPrice,
      daysRemaining,
    };
  }

  /**
   * Create storage upgrade
   */
  async createStorageUpgrade(
    tenantId: number,
    upgradeType: StorageUpgradeType,
    additionalGB: number,
  ): Promise<StorageUpgrade> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const subscription = await this.tenantSubscriptionRepository.findOne({
      where: { tenantId },
    });

    if (!subscription) {
      throw new BadRequestException('Tenant tidak memiliki subscription aktif');
    }

    // Calculate price
    const { pricePerYear, proRatedPrice, daysRemaining } = this.calculateUpgradePrice(
      upgradeType,
      additionalGB,
      subscription.endDate,
    );

    // Create upgrade record
    const upgrade = this.storageUpgradeRepository.create({
      tenantId,
      tenantSubscriptionId: subscription.id,
      upgradeType,
      additionalStorageGB: additionalGB,
      pricePerYear,
      proRatedPrice,
      status: StorageUpgradeStatus.PENDING,
      startDate: new Date(),
      endDate: subscription.endDate,
    });

    const savedUpgrade = await this.storageUpgradeRepository.save(upgrade);

    // Note: Storage limit will be updated when upgrade is activated (after payment)
    // Don't update here because upgrade is still PENDING

    return savedUpgrade;
  }

  /**
   * Activate storage upgrade (setelah payment)
   */
  async activateStorageUpgrade(upgradeId: number, paymentNotes?: string): Promise<StorageUpgrade> {
    const upgrade = await this.storageUpgradeRepository.findOne({
      where: { id: upgradeId },
    });

    if (!upgrade) {
      throw new NotFoundException(`Storage upgrade with ID ${upgradeId} not found`);
    }

    upgrade.status = StorageUpgradeStatus.ACTIVE;
    upgrade.isPaid = true;
    upgrade.paidAt = new Date();
    if (paymentNotes) {
      upgrade.paymentNotes = paymentNotes;
    }

    const savedUpgrade = await this.storageUpgradeRepository.save(upgrade);

    // Update storage limit
    await this.updateStorageLimitForTenant(upgrade.tenantId);

    return savedUpgrade;
  }

  /**
   * Get active upgrades untuk tenant
   */
  async getActiveUpgrades(tenantId: number): Promise<StorageUpgrade[]> {
    return this.storageUpgradeRepository.find({
      where: {
        tenantId,
        status: StorageUpgradeStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }
}

