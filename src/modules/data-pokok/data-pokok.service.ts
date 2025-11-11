import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataPokok } from './entities/data-pokok.entity';
import { CreateDataPokokDto } from './dto/create-data-pokok.dto';
import { UpdateDataPokokDto } from './dto/update-data-pokok.dto';

@Injectable()
export class DataPokokService {
  constructor(
    @InjectRepository(DataPokok)
    private dataPokokRepository: Repository<DataPokok>,
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

    if (!dataPokok) {
      throw new NotFoundException('Data pokok not found');
    }

    return dataPokok;
  }

  async update(updateDataPokokDto: UpdateDataPokokDto, instansiId: number) {
    const dataPokok = await this.findOne(instansiId);

    // Prepare update data, handling null values properly
    const updateData: any = { ...updateDataPokokDto };

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
    const dataPokok = await this.findOne(instansiId);
    await this.dataPokokRepository.remove(dataPokok);
    return { message: 'Data pokok deleted successfully' };
  }
}

