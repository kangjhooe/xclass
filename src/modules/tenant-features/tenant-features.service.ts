import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantFeature } from './entities/tenant-feature.entity';
import { TenantModule } from './entities/tenant-module.entity';

@Injectable()
export class TenantFeaturesService {
  constructor(
    @InjectRepository(TenantFeature)
    private tenantFeatureRepository: Repository<TenantFeature>,
    @InjectRepository(TenantModule)
    private tenantModuleRepository: Repository<TenantModule>,
  ) {}

  // Features Management
  async getTenantFeatures(tenantId: number) {
    return this.tenantFeatureRepository.find({
      where: { tenantId },
      order: { featureName: 'ASC' },
    });
  }

  async getTenantFeature(tenantId: number, featureKey: string) {
    const feature = await this.tenantFeatureRepository.findOne({
      where: { tenantId, featureKey },
    });
    if (!feature) {
      throw new NotFoundException(
        `Feature "${featureKey}" not found for tenant ${tenantId}`,
      );
    }
    return feature;
  }

  async createTenantFeature(
    tenantId: number,
    featureData: Partial<TenantFeature>,
  ) {
    const feature = this.tenantFeatureRepository.create({
      ...featureData,
      tenantId,
    });
    return this.tenantFeatureRepository.save(feature);
  }

  async updateTenantFeature(
    tenantId: number,
    featureKey: string,
    updateData: Partial<TenantFeature>,
  ) {
    const feature = await this.getTenantFeature(tenantId, featureKey);
    Object.assign(feature, updateData);
    return this.tenantFeatureRepository.save(feature);
  }

  async toggleTenantFeature(tenantId: number, featureKey: string) {
    const feature = await this.getTenantFeature(tenantId, featureKey);
    feature.isEnabled = !feature.isEnabled;
    return this.tenantFeatureRepository.save(feature);
  }

  async deleteTenantFeature(tenantId: number, featureKey: string) {
    const feature = await this.getTenantFeature(tenantId, featureKey);
    return this.tenantFeatureRepository.remove(feature);
  }

  // Modules Management
  async getTenantModules(tenantId: number) {
    return this.tenantModuleRepository.find({
      where: { tenantId },
      order: { moduleName: 'ASC' },
    });
  }

  async getTenantModule(tenantId: number, moduleKey: string) {
    const module = await this.tenantModuleRepository.findOne({
      where: { tenantId, moduleKey },
    });
    if (!module) {
      throw new NotFoundException(
        `Module "${moduleKey}" not found for tenant ${tenantId}`,
      );
    }
    return module;
  }

  async createTenantModule(
    tenantId: number,
    moduleData: Partial<TenantModule>,
  ) {
    const module = this.tenantModuleRepository.create({
      ...moduleData,
      tenantId,
    });
    return this.tenantModuleRepository.save(module);
  }

  async updateTenantModule(
    tenantId: number,
    moduleKey: string,
    updateData: Partial<TenantModule>,
  ) {
    const module = await this.getTenantModule(tenantId, moduleKey);
    Object.assign(module, updateData);
    return this.tenantModuleRepository.save(module);
  }

  async toggleTenantModule(tenantId: number, moduleKey: string) {
    const module = await this.getTenantModule(tenantId, moduleKey);
    module.isEnabled = !module.isEnabled;
    return this.tenantModuleRepository.save(module);
  }

  async deleteTenantModule(tenantId: number, moduleKey: string) {
    const module = await this.getTenantModule(tenantId, moduleKey);
    return this.tenantModuleRepository.remove(module);
  }

  // Bulk operations
  async enableFeaturesForTenant(tenantId: number, featureKeys: string[]) {
    const features = await Promise.all(
      featureKeys.map(async (key) => {
        let feature = await this.tenantFeatureRepository.findOne({
          where: { tenantId, featureKey: key },
        });
        if (!feature) {
          feature = this.tenantFeatureRepository.create({
            tenantId,
            featureKey: key,
            featureName: key,
            isEnabled: true,
          });
        } else {
          feature.isEnabled = true;
        }
        return feature;
      }),
    );
    return this.tenantFeatureRepository.save(features);
  }

  async enableModulesForTenant(tenantId: number, moduleKeys: string[]) {
    const modules = await Promise.all(
      moduleKeys.map(async (key) => {
        let module = await this.tenantModuleRepository.findOne({
          where: { tenantId, moduleKey: key },
        });
        if (!module) {
          module = this.tenantModuleRepository.create({
            tenantId,
            moduleKey: key,
            moduleName: key,
            isEnabled: true,
          });
        } else {
          module.isEnabled = true;
        }
        return module;
      }),
    );
    return this.tenantModuleRepository.save(modules);
  }
}

