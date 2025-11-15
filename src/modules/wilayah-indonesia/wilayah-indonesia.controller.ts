import { Controller, Get, Param, Query } from '@nestjs/common';
import { WilayahIndonesiaService } from './wilayah-indonesia.service';

@Controller('wilayah-indonesia')
export class WilayahIndonesiaController {
  constructor(private readonly wilayahService: WilayahIndonesiaService) {}

  @Get('provinces')
  async getAllProvinces() {
    const provinces = await this.wilayahService.getAllProvinces();
    return {
      data: provinces.map((p) => ({
        code: p.code,
        name: p.name,
      })),
    };
  }

  @Get('regencies')
  async getRegencies(@Query('provinceCode') provinceCode: string) {
    if (!provinceCode) {
      return { data: [] };
    }
    const regencies = await this.wilayahService.getRegenciesByProvince(provinceCode);
    return {
      data: regencies.map((r) => ({
        code: r.code,
        name: r.name,
        provinceCode: r.provinceCode,
      })),
    };
  }

  @Get('districts')
  async getDistricts(@Query('regencyCode') regencyCode: string) {
    if (!regencyCode) {
      return { data: [] };
    }
    const districts = await this.wilayahService.getDistrictsByRegency(regencyCode);
    return {
      data: districts.map((d) => ({
        code: d.code,
        name: d.name,
        regencyCode: d.regencyCode,
      })),
    };
  }

  @Get('villages')
  async getVillages(@Query('districtCode') districtCode: string) {
    if (!districtCode) {
      return { data: [] };
    }
    const villages = await this.wilayahService.getVillagesByDistrict(districtCode);
    return {
      data: villages.map((v) => ({
        code: v.code,
        name: v.name,
        districtCode: v.districtCode,
      })),
    };
  }
}

