import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../modules/tenant/tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from various sources (prioritas: user > header > params > subdomain)
    // Sekarang params.tenant bisa berupa NPSN atau ID
    const userTenantId = (req['user'] as any)?.instansiId;
    const tenantIdHeader = req.headers['x-tenant-id'];
    const tenantNpsnHeader = req.headers['x-tenant-npsn'];

    let tenantId =
      userTenantId ||               // Dari user yang sudah login (JWT)
      tenantIdHeader ||             // Dari header ID langsung
      req.params?.tenant ||         // Dari route parameter (bisa NPSN atau ID)
      req.subdomains?.[0];          // Dari subdomain

    // Jika ada header X-Tenant-NPSN, prioritaskan untuk resolve tenant
    if (!userTenantId && tenantNpsnHeader) {
      try {
        const tenant = await this.tenantService.findByNpsn(tenantNpsnHeader.toString());
        if (tenant) {
          tenantId = tenant.id;
          req['tenantNpsn'] = tenant.npsn;
        }
      } catch (error) {
        // Jika terjadi error saat mencari berdasarkan NPSN, abaikan dan lanjutkan
      }
    }

    // Jika tenant dari params atau subdomain, cek apakah itu NPSN atau ID
    if (tenantId && !(req['user'] as any)?.instansiId) {
      // Cek apakah itu angka (ID) atau string (NPSN)
      const isNumeric = /^\d+$/.test(tenantId.toString());
      
      if (!isNumeric) {
        // Kemungkinan NPSN, cari tenant berdasarkan NPSN
        try {
          const tenant = await this.tenantService.findByNpsn(tenantId.toString());
          if (tenant) {
            tenantId = tenant.id;
            req['tenantNpsn'] = tenant.npsn;
          }
        } catch (error) {
          // Jika error, tetap gunakan tenantId asli
        }
      } else {
        // Jika numeric, bisa jadi ID, tapi bisa juga NPSN yang numeric
        // Cek dulu apakah ada tenant dengan NPSN tersebut
        try {
          const tenantByNpsn = await this.tenantService.findByNpsn(tenantId.toString());
          if (tenantByNpsn) {
            req['tenantNpsn'] = tenantByNpsn.npsn;
            // Tetap gunakan ID untuk tenantId
            tenantId = tenantByNpsn.id;
          }
        } catch (error) {
          // Jika error, anggap sebagai ID
        }
      }
    }

    if (tenantId) {
      req['tenantId'] = tenantId;
    }

    next();
  }
}

