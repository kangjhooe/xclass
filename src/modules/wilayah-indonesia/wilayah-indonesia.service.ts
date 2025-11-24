import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { Regency } from './entities/regency.entity';
import { District } from './entities/district.entity';
import { Village } from './entities/village.entity';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WilayahIndonesiaService {
  private readonly logger = new Logger(WilayahIndonesiaService.name);
  private readonly httpClient: AxiosInstance;
  // Menggunakan API wilayah.id yang menyediakan data dari Kemendagri
  // Format: https://wilayah.id/api/{level}/{code}.json
  private readonly API_BASE_URL = 'https://wilayah.id/api';

  constructor(
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
    @InjectRepository(Regency)
    private regencyRepository: Repository<Regency>,
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(Village)
    private villageRepository: Repository<Village>,
  ) {
    this.httpClient = axios.create({
      timeout: 15000,
      baseURL: this.API_BASE_URL,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  private unwrapApiPayload(raw: any, hintKeys: string[] = []): any {
    if (!raw) {
      return [];
    }

    if (Array.isArray(raw)) {
      return raw;
    }

    if (raw.data !== undefined) {
      const nested = this.unwrapApiPayload(raw.data, hintKeys);
      if (Array.isArray(nested) || (nested && typeof nested === 'object')) {
        return nested;
      }
    }

    for (const key of hintKeys) {
      const candidate = raw[key];
      if (candidate !== undefined) {
        const nested = this.unwrapApiPayload(candidate, hintKeys);
        if (Array.isArray(nested) || (nested && typeof nested === 'object')) {
          return nested;
        }
      }
    }

    return raw;
  }

  private normalizeLocationItem(
    item: any,
    extraCodeKeys: string[] = [],
  ): { code: string; name: string } | null {
    if (!item) return null;

    const name =
      item.name ??
      item.nama ??
      item.text ??
      item.title ??
      (typeof item === 'string' ? item : undefined);

    const codeCandidates = [
      item.code,
      item.id,
      item.kode,
      item.kode_dagri,
      item.kodeKemendagri,
      ...extraCodeKeys.map((key) => item[key]),
    ].filter((val) => val !== undefined && val !== null && val !== '');

    if (!name || codeCandidates.length === 0) {
      return null;
    }

    return {
      code: String(codeCandidates[0]),
      name: String(name),
    };
  }

  private objectMapToArray(obj: any): Array<{ code: string; name: string }> {
    if (!obj || typeof obj !== 'object') {
      return [];
    }

    return Object.entries(obj).map(([code, name]) => ({
      code: String(code),
      name: String(name),
    }));
  }

  async getAllProvinces(): Promise<Province[]> {
    // Cek database lokal dulu
    const localData = await this.provinceRepository.find({
      order: { name: 'ASC' },
    });

    // Jika ada data di database, gunakan data lokal
    if (localData && localData.length > 0) {
      return localData;
    }

    // Jika tidak ada, fetch dari API dan cache ke database
    try {
      const response = await this.httpClient.get('/provinces.json');
      const apiData = response.data;

      const rawPayload = this.unwrapApiPayload(apiData, ['data', 'result', 'provinces', 'provinsi']);
      let provinceList: Province[] = [];

      if (Array.isArray(rawPayload)) {
        provinceList = rawPayload
          .map((item: any) => this.normalizeLocationItem(item))
          .filter(Boolean)
          .map((item) => ({
            code: item!.code,
            name: item!.name,
            regencies: [],
          }));
      } else if (rawPayload && typeof rawPayload === 'object') {
        provinceList = this.objectMapToArray(rawPayload).map((item) => ({
          code: item.code,
          name: item.name,
          regencies: [],
        }));
      }

      // Cache ke database
      if (provinceList.length > 0) {
        for (const province of provinceList) {
          const existing = await this.provinceRepository.findOne({
            where: { code: province.code },
          });
          if (!existing) {
            await this.provinceRepository.save(
              this.provinceRepository.create(province),
            );
          }
        }
        this.logger.log(`Cached ${provinceList.length} provinces to database`);
      }

      return provinceList;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch provinces from API: ${error.message}`,
        error.stack,
      );
      return localData; // Return empty array if API fails
    }
  }

  async getRegenciesByProvince(provinceCode: string): Promise<Regency[]> {
    // Cek database lokal dulu
    const localData = await this.regencyRepository.find({
      where: { provinceCode },
      order: { name: 'ASC' },
    });

    // Jika ada data di database, gunakan data lokal
    if (localData && localData.length > 0) {
      return localData;
    }

    // Jika tidak ada, fetch dari API dan cache ke database
    try {
      const response = await this.httpClient.get(
        `/regencies/${provinceCode}.json`,
      );
      const apiData = response.data;

      const rawPayload = this.unwrapApiPayload(apiData, ['data', 'result', 'regencies', 'kabupaten', 'kota']);
      let regencies: Regency[] = [];

      if (Array.isArray(rawPayload)) {
        regencies = rawPayload
          .map((item: any) => this.normalizeLocationItem(item, ['kode', 'kode_kabupaten']))
          .filter(Boolean)
          .map((item) => ({
            code: item!.code,
            name: item!.name,
            provinceCode,
            districts: [],
          }));
      } else if (rawPayload && typeof rawPayload === 'object') {
        regencies = this.objectMapToArray(rawPayload).map((item) => ({
          code: item.code,
          name: item.name,
          provinceCode,
          districts: [],
        }));
      }

      // Cache ke database
      if (regencies.length > 0) {
        for (const regency of regencies) {
          const existing = await this.regencyRepository.findOne({
            where: { code: regency.code },
          });
          if (!existing) {
            await this.regencyRepository.save(
              this.regencyRepository.create(regency),
            );
          }
        }
        this.logger.log(
          `Cached ${regencies.length} regencies for province ${provinceCode}`,
        );
      }

      return regencies;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch regencies for province ${provinceCode} from API: ${error.message}`,
        error.stack,
      );
      return localData; // Return empty array if API fails
    }
  }

  async getDistrictsByRegency(regencyCode: string): Promise<District[]> {
    // Cek database lokal dulu
    const localData = await this.districtRepository.find({
      where: { regencyCode },
      order: { name: 'ASC' },
    });

    // Jika ada data di database, gunakan data lokal
    if (localData && localData.length > 0) {
      return localData;
    }

    // Jika tidak ada, fetch dari API dan cache ke database
    try {
      const response = await this.httpClient.get(
        `/districts/${regencyCode}.json`,
      );
      const apiData = response.data;

      const rawPayload = this.unwrapApiPayload(apiData, ['data', 'result', 'districts', 'kecamatan']);
      let districts: District[] = [];

      if (Array.isArray(rawPayload)) {
        districts = rawPayload
          .map((item: any) => this.normalizeLocationItem(item, ['kode', 'kode_kecamatan']))
          .filter(Boolean)
          .map((item) => ({
            code: item!.code,
            name: item!.name,
            regencyCode,
            villages: [],
          }));
      } else if (rawPayload && typeof rawPayload === 'object') {
        districts = this.objectMapToArray(rawPayload).map((item) => ({
          code: item.code,
          name: item.name,
          regencyCode,
          villages: [],
        }));
      }

      // Cache ke database
      if (districts.length > 0) {
        for (const district of districts) {
          const existing = await this.districtRepository.findOne({
            where: { code: district.code },
          });
          if (!existing) {
            await this.districtRepository.save(
              this.districtRepository.create(district),
            );
          }
        }
        this.logger.log(
          `Cached ${districts.length} districts for regency ${regencyCode}`,
        );
      }

      return districts;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch districts for regency ${regencyCode} from API: ${error.message}`,
        error.stack,
      );
      return localData; // Return empty array if API fails
    }
  }

  async getVillagesByDistrict(districtCode: string): Promise<Village[]> {
    // Cek database lokal dulu
    const localData = await this.villageRepository.find({
      where: { districtCode },
      order: { name: 'ASC' },
    });

    // Jika ada data di database, gunakan data lokal
    if (localData && localData.length > 0) {
      return localData;
    }

    // Jika tidak ada, fetch dari API dan cache ke database
    try {
      const response = await this.httpClient.get(
        `/villages/${districtCode}.json`,
      );
      const apiData = response.data;

      const rawPayload = this.unwrapApiPayload(apiData, ['data', 'result', 'villages', 'desa', 'kelurahan']);
      let villages: Village[] = [];

      if (Array.isArray(rawPayload)) {
        villages = rawPayload
          .map((item: any) => this.normalizeLocationItem(item, ['kode', 'kode_desa', 'kode_kelurahan']))
          .filter(Boolean)
          .map((item) => ({
            code: item!.code,
            name: item!.name,
            districtCode,
          }));
      } else if (rawPayload && typeof rawPayload === 'object') {
        villages = this.objectMapToArray(rawPayload).map((item) => ({
          code: item.code,
          name: item.name,
          districtCode,
        }));
      }

      // Cache ke database
      if (villages.length > 0) {
        for (const village of villages) {
          const existing = await this.villageRepository.findOne({
            where: { code: village.code },
          });
          if (!existing) {
            await this.villageRepository.save(
              this.villageRepository.create(village),
            );
          }
        }
        this.logger.log(
          `Cached ${villages.length} villages for district ${districtCode}`,
        );
      }

      return villages;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch villages for district ${districtCode} from API: ${error.message}`,
        error.stack,
      );
      return localData; // Return empty array if API fails
    }
  }

  async getProvinceByCode(code: string): Promise<Province | null> {
    return this.provinceRepository.findOne({ where: { code } });
  }

  async getRegencyByCode(code: string): Promise<Regency | null> {
    return this.regencyRepository.findOne({ where: { code } });
  }

  async getDistrictByCode(code: string): Promise<District | null> {
    return this.districtRepository.findOne({ where: { code } });
  }

  async getVillageByCode(code: string): Promise<Village | null> {
    return this.villageRepository.findOne({ where: { code } });
  }
}

