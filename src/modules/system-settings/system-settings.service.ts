import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private systemSettingsRepository: Repository<SystemSetting>,
  ) {}

  async findAll(category?: string) {
    const where: any = {};
    if (category) {
      where.category = category;
    }
    return this.systemSettingsRepository.find({
      where,
      order: { category: 'ASC', key: 'ASC' },
    });
  }

  async findOne(key: string) {
    const setting = await this.systemSettingsRepository.findOne({
      where: { key },
    });
    if (!setting) {
      throw new NotFoundException(`System setting with key "${key}" not found`);
    }
    return setting;
  }

  async getValue(key: string, defaultValue?: any) {
    try {
      const setting = await this.findOne(key);
      return this.parseValue(setting.value, setting.type);
    } catch (error) {
      return defaultValue;
    }
  }

  async setValue(key: string, value: any, type?: string) {
    let setting = await this.systemSettingsRepository.findOne({
      where: { key },
    });

    if (!setting) {
      setting = this.systemSettingsRepository.create({
        key,
        value: this.stringifyValue(value),
        type: type || this.inferType(value),
      });
    } else {
      setting.value = this.stringifyValue(value);
      if (type) {
        setting.type = type;
      }
    }

    return this.systemSettingsRepository.save(setting);
  }

  async update(key: string, updateData: Partial<SystemSetting>) {
    const setting = await this.findOne(key);
    Object.assign(setting, updateData);
    if (updateData.value !== undefined) {
      setting.value = this.stringifyValue(updateData.value);
    }
    return this.systemSettingsRepository.save(setting);
  }

  async create(createData: Partial<SystemSetting>) {
    const setting = this.systemSettingsRepository.create({
      ...createData,
      value: createData.value
        ? this.stringifyValue(createData.value)
        : createData.value,
      type: createData.type || this.inferType(createData.value),
    });
    return this.systemSettingsRepository.save(setting);
  }

  async delete(key: string) {
    const setting = await this.findOne(key);
    return this.systemSettingsRepository.remove(setting);
  }

  async getByCategory(category: string) {
    return this.systemSettingsRepository.find({
      where: { category },
      order: { key: 'ASC' },
    });
  }

  async getCategories() {
    const settings = await this.systemSettingsRepository.find({
      select: ['category'],
    });
    const categories = [...new Set(settings.map((s) => s.category).filter((c) => c !== null))];
    return categories;
  }

  private parseValue(value: string, type?: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === '1';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  private stringifyValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private inferType(value: any): string {
    if (value === null || value === undefined) {
      return 'string';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'object') {
      return 'json';
    }
    return 'string';
  }
}

