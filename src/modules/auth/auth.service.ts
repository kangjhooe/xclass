import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterPpdbDto } from './dto/register-ppdb.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      console.log('Login attempt for email:', loginDto.email);
      
      let user: User | null = null;
      try {
        user = await this.userRepository.findOne({
          where: { email: loginDto.email },
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw new UnauthorizedException('Terjadi kesalahan saat mengakses database. Silakan coba lagi.');
      }

      if (!user) {
        console.log('User not found:', loginDto.email);
        throw new UnauthorizedException('Email atau password salah');
      }

      if (!user.password) {
        console.log('User has no password:', loginDto.email);
        throw new UnauthorizedException('Email atau password salah');
      }

      // Check if password is already hashed (starts with $2a$ or $2b$)
      const isPasswordHashed = typeof user.password === 'string' && 
        (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
      
      let isPasswordValid = false;
      try {
        if (isPasswordHashed) {
          isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        } else {
          // If password is not hashed, compare directly (for migration purposes)
          isPasswordValid = user.password === loginDto.password;
        }
      } catch (bcryptError: any) {
        console.error('Bcrypt compare error:', bcryptError);
        throw new UnauthorizedException('Email atau password salah');
      }

      if (!isPasswordValid) {
        console.log('Invalid password for user:', loginDto.email);
        throw new UnauthorizedException('Email atau password salah');
      }

      if (!user.isActive) {
        console.log('User account inactive:', loginDto.email);
        throw new UnauthorizedException('Akun Anda tidak aktif. Silakan hubungi administrator');
      }

      // Update last login
      try {
        await this.userRepository.update(user.id, { lastLoginAt: new Date() });
      } catch (updateError) {
        // Log error but don't fail login
        console.error('Error updating last login:', updateError);
      }

      const payload: any = {
        sub: user.id,
        email: user.email,
        role: user.role,
        userId: user.id,
      };

      // Only add instansiId if it exists
      if (user.instansiId) {
        payload.instansiId = user.instansiId;
      }

      let accessToken: string;
      try {
        accessToken = this.jwtService.sign(payload);
      } catch (jwtError: any) {
        console.error('JWT sign error:', jwtError);
        throw new UnauthorizedException('Terjadi kesalahan saat membuat token. Silakan coba lagi.');
      }

      const { password, rememberToken, ...userWithoutPassword } = user;

      console.log('Login successful for user:', user.email);

      return {
        access_token: accessToken,
        user: userWithoutPassword,
      };
    } catch (error: any) {
      // If it's already an UnauthorizedException, re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log other errors and throw a generic message
      console.error('Login error:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      throw new UnauthorizedException('Terjadi kesalahan saat login. Silakan coba lagi.');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, rememberToken: __, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user && user.isActive) {
      const { password: _, rememberToken: __, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto) {
    try {
      // Validasi password confirmation
      if (registerDto.password !== registerDto.password_confirmation) {
        throw new BadRequestException('Password dan konfirmasi password tidak cocok');
      }

      // Cek apakah NPSN sudah ada
      const existingTenant = await this.tenantRepository.findOne({
        where: { npsn: registerDto.npsn },
      });
      if (existingTenant) {
        throw new ConflictException('NPSN sudah terdaftar');
      }

      // Cek apakah email sudah ada
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email sudah terdaftar');
      }

      // Buat tenant baru
      const tenant = this.tenantRepository.create({
        npsn: registerDto.npsn,
        name: registerDto.name,
        email: registerDto.email,
        phone: registerDto.picWhatsapp || null, // Simpan No WA PIC di phone
        address: null,
        isActive: true,
        settings: {
          jenisInstansi: registerDto.jenisInstansi,
          jenjang: registerDto.jenjang,
          status: registerDto.status,
          picName: registerDto.picName,
          picWhatsapp: registerDto.picWhatsapp,
        },
      });
      const savedTenant = await this.tenantRepository.save(tenant);

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Buat user baru dengan role admin_tenant (gunakan nama PIC sebagai nama user)
      const user = this.userRepository.create({
        name: registerDto.picName, // Gunakan nama PIC sebagai nama user
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.picWhatsapp || null,
        role: 'admin_tenant',
        instansiId: savedTenant.id,
        isActive: true,
      });
      const savedUser = await this.userRepository.save(user);

      // Generate JWT token
      const payload: any = {
        sub: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        userId: savedUser.id,
        instansiId: savedTenant.id,
      };

      const accessToken = this.jwtService.sign(payload);

      const { password, rememberToken, ...userWithoutPassword } = savedUser;

      return {
        access_token: accessToken,
        user: userWithoutPassword,
        tenant: savedTenant,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Register error:', error);
      throw new BadRequestException('Registrasi gagal. Silakan coba lagi.');
    }
  }

  async registerPpdb(registerDto: RegisterPpdbDto) {
    try {
      // Validasi password confirmation
      if (registerDto.password !== registerDto.password_confirmation) {
        throw new BadRequestException('Password dan konfirmasi password tidak cocok');
      }

      // Cari tenant berdasarkan NPSN
      const tenant = await this.tenantRepository.findOne({
        where: { npsn: registerDto.npsn },
      });

      if (!tenant) {
        throw new BadRequestException('NPSN sekolah tidak ditemukan');
      }

      if (!tenant.isActive) {
        throw new BadRequestException('Sekolah tidak aktif menerima pendaftaran');
      }

      // Cek apakah email sudah ada
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email sudah terdaftar');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Buat user baru dengan role ppdb_applicant
      const user = this.userRepository.create({
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: null,
        role: 'ppdb_applicant',
        instansiId: tenant.id,
        isActive: true,
      });

      const savedUser = await this.userRepository.save(user);

      // Generate JWT token
      const payload: any = {
        sub: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        userId: savedUser.id,
        instansiId: tenant.id,
      };

      const accessToken = this.jwtService.sign(payload);

      const { password, rememberToken, ...userWithoutPassword } = savedUser;

      return {
        access_token: accessToken,
        user: userWithoutPassword,
        tenant: tenant,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Register PPDB error:', error);
      throw new BadRequestException('Registrasi gagal. Silakan coba lagi.');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Untuk security, jangan reveal bahwa email tidak ditemukan
      return {
        message: 'Jika email terdaftar, instruksi reset password akan dikirim ke email Anda.',
      };
    }

    // Generate reset token sederhana (untuk production, gunakan token yang lebih aman)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // Simpan token di rememberToken field (sementara)
    user.rememberToken = resetToken;
    await this.userRepository.save(user);

    // TODO: Kirim email dengan reset token
    // Untuk sekarang, return token (dalam production, kirim via email)
    return {
      message: 'Instruksi reset password telah dikirim ke email Anda.',
      // Hanya untuk development/testing - hapus di production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  async resetPassword(email: string, newPassword: string, confirmPassword: string, resetToken?: string) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Password dan konfirmasi password tidak cocok');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Password minimal 8 karakter');
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email tidak ditemukan');
    }

    // Validasi reset token jika ada
    if (resetToken && user.rememberToken !== resetToken) {
      throw new BadRequestException('Token reset password tidak valid atau sudah kadaluarsa');
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.rememberToken = null; // Clear reset token
    await this.userRepository.save(user);

    return {
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    };
  }
}
