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

      // Handle format API yang berbeda
      let provinces: Province[] = [];
      
      if (Array.isArray(apiData)) {
        // Format array: [{code: "11", name: "ACEH"}, ...]
        provinces = apiData.map((item: any) => ({
          code: item.code || item.id,
          name: item.name,
          regencies: [],
        })) as Province[];
      } else if (typeof apiData === 'object') {
        // Format object: {"11": "ACEH", "12": "SUMATERA UTARA", ...}
        provinces = Object.keys(apiData).map((code) => ({
          code,
          name: apiData[code],
          regencies: [],
        })) as Province[];
      }

      // Cache ke database
      if (provinces.length > 0) {
        for (const province of provinces) {
          const existing = await this.provinceRepository.findOne({
            where: { code: province.code },
          });
          if (!existing) {
            await this.provinceRepository.save(
              this.provinceRepository.create(province),
            );
          }
        }
        this.logger.log(`Cached ${provinces.length} provinces to database`);
      }

      return provinces;
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

      // Handle format API yang berbeda
      let regencies: Regency[] = [];
      
      if (Array.isArray(apiData)) {
        regencies = apiData.map((item: any) => ({
          code: item.code || item.id,
          name: item.name,
          provinceCode,
          districts: [],
        })) as Regency[];
      } else if (typeof apiData === 'object') {
        regencies = Object.keys(apiData).map((code) => ({
          code,
          name: apiData[code],
          provinceCode,
          districts: [],
        })) as Regency[];
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

      // Handle format API yang berbeda
      let districts: District[] = [];
      
      if (Array.isArray(apiData)) {
        districts = apiData.map((item: any) => ({
          code: item.code || item.id,
          name: item.name,
          regencyCode,
          villages: [],
        })) as District[];
      } else if (typeof apiData === 'object') {
        districts = Object.keys(apiData).map((code) => ({
          code,
          name: apiData[code],
          regencyCode,
          villages: [],
        })) as District[];
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

      // Handle format API yang berbeda
      let villages: Village[] = [];
      
      if (Array.isArray(apiData)) {
        villages = apiData.map((item: any) => ({
          code: item.code || item.id,
          name: item.name,
          districtCode,
        })) as Village[];
      } else if (typeof apiData === 'object') {
        villages = Object.keys(apiData).map((code) => ({
          code,
          name: apiData[code],
          districtCode,
        })) as Village[];
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

