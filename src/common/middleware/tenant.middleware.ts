import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../modules/tenant/tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from various sources (prioritas: user > header > params > subdomain)
    // Sekarang params.tenant bisa berupa NPSN atau ID
    let tenantId = 
      (req['user'] as any)?.instansiId ||      // Dari user yang sudah login (JWT)
      req.headers['x-tenant-id'] ||            // Dari header
      req.params?.tenant ||                    // Dari route parameter (bisa NPSN atau ID)
      req.subdomains?.[0];                     // Dari subdomain

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

