import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataPokok } from './entities/data-pokok.entity';
import { CreateDataPokokDto } from './dto/create-data-pokok.dto';
import { UpdateDataPokokDto } from './dto/update-data-pokok.dto';
import { Tenant } from '../tenant/entities/tenant.entity';
import { TenantProfile } from '../public-page/entities/tenant-profile.entity';

@Injectable()
export class DataPokokService {
  constructor(
    @InjectRepository(DataPokok)
    private dataPokokRepository: Repository<DataPokok>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantProfile)
    private tenantProfileRepository: Repository<TenantProfile>,
  ) {}

  async create(createDataPokokDto: CreateDataPokokDto, instansiId: number) {
    // Check if data pokok already exists for this tenant
    const existing = await this.dataPokokRepository.findOne({
      where: { instansiId },
    });

    if (existing) {
      throw new BadRequestException('Data pokok already exists for this tenant');
    }

    const dataPokok = this.dataPokokRepository.create({
      ...createDataPokokDto,
      instansiId,
      accreditationDate: createDataPokokDto.accreditationDate
        ? new Date(createDataPokokDto.accreditationDate)
        : null,
      licenseDate: createDataPokokDto.licenseDate
        ? new Date(createDataPokokDto.licenseDate)
        : null,
      establishedDate: createDataPokokDto.establishedDate
        ? new Date(createDataPokokDto.establishedDate)
        : null,
    });

    return await this.dataPokokRepository.save(dataPokok);
  }

  async findOne(instansiId: number) {
    const dataPokok = await this.dataPokokRepository.findOne({
      where: { instansiId },
    });

    if (dataPokok) {
      return dataPokok;
    }

    const tenant = await this.tenantRepository.findOne({ where: { id: instansiId } });

    if (!tenant) {
      throw new NotFoundException('Data pokok not found');
    }

    const tenantProfile = await this.tenantProfileRepository.findOne({
      where: { instansiId },
    });

    const settings = (tenant.settings || {}) as Record<string, any>;
    const getSetting = (...keys: string[]) => {
      for (const key of keys) {
        const value = settings?.[key];
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
      return undefined;
    };

    // Automatically bootstrap data pokok using the tenant's initial identity data
    const initialData = this.dataPokokRepository.create({
      instansiId,
      npsn: tenant.npsn,
      name: tenant.name,
      email: tenant.email || tenantProfile?.email,
      phone: tenant.phone || tenantProfile?.phone,
      address: tenant.address || tenantProfile?.address,
      website: tenantProfile?.website,
      description: tenantProfile?.description,
      vision: tenantProfile?.vision,
      mission: tenantProfile?.mission,
      type: getSetting('type', 'schoolType'),
      jenjang: getSetting('jenjang', 'educationLevel'),
      kurikulum: getSetting('kurikulum', 'curriculum'),
      tahunPelajaranAktif: getSetting('tahunPelajaranAktif', 'activeAcademicYear'),
    });

    return await this.dataPokokRepository.save(initialData);
  }

  async update(updateDataPokokDto: UpdateDataPokokDto, instansiId: number) {
    const dataPokok = await this.findOne(instansiId);

    // Prepare update data, handling null values properly
    const updateData: any = { ...updateDataPokokDto };

    if (updateData.npsn !== undefined) {
      delete updateData.npsn;
    }

    // Handle date fields - only update if provided, set to null if explicitly null
    if (updateDataPokokDto.accreditationDate !== undefined) {
      updateData.accreditationDate = updateDataPokokDto.accreditationDate
        ? new Date(updateDataPokokDto.accreditationDate)
        : null;
    }
    if (updateDataPokokDto.licenseDate !== undefined) {
      updateData.licenseDate = updateDataPokokDto.licenseDate
        ? new Date(updateDataPokokDto.licenseDate)
        : null;
    }
    if (updateDataPokokDto.establishedDate !== undefined) {
      updateData.establishedDate = updateDataPokokDto.establishedDate
        ? new Date(updateDataPokokDto.establishedDate)
        : null;
    }

    // Remove undefined values to avoid overwriting with undefined
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    Object.assign(dataPokok, updateData);

    return await this.dataPokokRepository.save(dataPokok);
  }

  async remove(instansiId: number) {
    throw new BadRequestException('Data pokok tidak boleh dihapus');
  }
}

