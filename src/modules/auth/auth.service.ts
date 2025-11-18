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
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
    @InjectRepository(Student) private studentRepository: Repository<Student>,
    @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Generate random password dengan 8 huruf kecil
   */
  generateRandomPassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async login(loginDto: LoginDto) {
    try {
      let user: User | null = null;
      let student: Student | null = null;
      let teacher: Teacher | null = null;
      let identifier = '';

      // Login dengan NIK (siswa atau guru)
      if (loginDto.nik) {
        identifier = loginDto.nik;
        console.log('Login attempt for NIK:', loginDto.nik);
        
        try {
          // Cek siswa dulu
          student = await this.studentRepository.findOne({
            where: { nik: loginDto.nik },
          });

          if (student) {
            if (!student.isActive) {
              throw new UnauthorizedException('Akun siswa tidak aktif. Silakan hubungi administrator');
            }

            // Cari atau buat user untuk siswa
            user = await this.userRepository.findOne({
              where: { email: student.email || `student_${student.nik}@xclass.local` },
            });

            if (!user) {
              // Buat user baru untuk siswa jika belum ada
              // Password default untuk pertama kali: NIK itu sendiri (untuk kemudahan)
              // User bisa mengubah password setelah login pertama
              const defaultPassword = student.nik; // Gunakan NIK sebagai password default
              const hashedPassword = await bcrypt.hash(defaultPassword, 10);
              
              user = this.userRepository.create({
                name: student.name,
                email: student.email || `student_${student.nik}@xclass.local`,
                password: hashedPassword,
                phone: student.phone || null,
                role: 'student',
                instansiId: student.instansiId,
                isActive: true,
              });
              await this.userRepository.save(user);
              
              console.log(`User created for student ${student.nik}. Default password: NIK (${student.nik})`);
            }
          } else {
            // Jika bukan siswa, cek guru
            teacher = await this.teacherRepository.findOne({
              where: { nik: loginDto.nik },
            });

            if (!teacher) {
              console.log('Student or teacher not found with NIK:', loginDto.nik);
              throw new UnauthorizedException('NIK atau password salah');
            }

            if (!teacher.isActive) {
              throw new UnauthorizedException('Akun guru tidak aktif. Silakan hubungi administrator');
            }

            // Cari atau buat user untuk guru
            user = await this.userRepository.findOne({
              where: { email: teacher.email || `teacher_${teacher.nik}@xclass.local` },
            });

            if (!user) {
              // Buat user baru untuk guru jika belum ada
              // Password default untuk pertama kali: NIK itu sendiri (untuk kemudahan)
              // User bisa mengubah password setelah login pertama
              const defaultPassword = teacher.nik; // Gunakan NIK sebagai password default
              const hashedPassword = await bcrypt.hash(defaultPassword, 10);
              
              user = this.userRepository.create({
                name: teacher.name,
                email: teacher.email || `teacher_${teacher.nik}@xclass.local`,
                password: hashedPassword,
                phone: teacher.phone || null,
                role: 'teacher',
                instansiId: teacher.instansiId,
                isActive: true,
              });
              await this.userRepository.save(user);
              
              console.log(`User created for teacher ${teacher.nik}. Default password: NIK (${teacher.nik})`);
            }
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          if (dbError instanceof UnauthorizedException) {
            throw dbError;
          }
          throw new UnauthorizedException('Terjadi kesalahan saat mengakses database. Silakan coba lagi.');
        }
      }
      // Login dengan email (backward compatibility)
      else if (loginDto.email) {
        identifier = loginDto.email;
        console.log('Login attempt for email:', loginDto.email);
        
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
      } else {
        throw new BadRequestException('Email atau NIK (untuk siswa/guru) harus diisi');
      }

      if (!user) {
        throw new UnauthorizedException('Kredensial tidak ditemukan');
      }

      if (!user.password) {
        console.log('User has no password:', identifier);
        throw new UnauthorizedException('Password belum diatur. Silakan hubungi administrator');
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
        throw new UnauthorizedException('Password salah');
      }

      if (!isPasswordValid) {
        console.log('Invalid password for user:', identifier);
        throw new UnauthorizedException('Password salah');
      }

      if (!user.isActive) {
        console.log('User account inactive:', identifier);
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

      // Add NIK to payload for reference
      if (student) {
        payload.nik = student.nik;
        payload.studentId = student.id;
      }
      if (teacher) {
        payload.nik = teacher.nik;
        payload.teacherId = teacher.id;
      }

      let accessToken: string;
      try {
        accessToken = this.jwtService.sign(payload);
      } catch (jwtError: any) {
        console.error('JWT sign error:', jwtError);
        throw new UnauthorizedException('Terjadi kesalahan saat membuat token. Silakan coba lagi.');
      }

      const { password, rememberToken, ...userWithoutPassword } = user;

      console.log('Login successful for user:', identifier);

      return {
        access_token: accessToken,
        user: userWithoutPassword,
      };
    } catch (error: any) {
      // If it's already an UnauthorizedException or BadRequestException, re-throw it
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
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
      // Password confirmation sudah divalidasi di DTO validator
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
      // Password confirmation sudah divalidasi di DTO validator
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

    // Generate reset token yang aman
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15) +
                      Date.now().toString(36);
    
    // Simpan token di rememberToken field (expiry akan di-handle di resetPassword)
    // Format: token|timestamp untuk menyimpan expiry info
    const expiryTimestamp = Date.now() + 24 * 60 * 60 * 1000; // 24 jam
    user.rememberToken = `${resetToken}|${expiryTimestamp}`;
    await this.userRepository.save(user);

    // Get frontend URL from config or use default
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Prepare email content
    const emailSubject = 'Reset Password - XClass';
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Reset Password</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Halo,</p>
          <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p>Atau copy dan paste link berikut ke browser Anda:</p>
          <p style="background: #e9e9e9; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Penting:</strong>
            <ul style="color: #666; font-size: 14px;">
              <li>Link ini hanya berlaku selama 24 jam</li>
              <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
              <li>Jangan bagikan link ini kepada siapapun</li>
            </ul>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            Email ini dikirim secara otomatis, mohon jangan membalas email ini.
          </p>
        </div>
      </body>
      </html>
    `;

    try {
      // Send email via NotificationsService
      await this.notificationsService.sendEmail(
        user.instansiId || 0,
        user.id,
        email,
        emailSubject,
        emailContent,
      );
    } catch (error) {
      // Log error but don't reveal to user
      console.error('Failed to send password reset email:', error);
      // Still return success message for security
    }

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
    if (resetToken) {
      if (!user.rememberToken) {
        throw new BadRequestException('Token reset password tidak valid atau sudah kadaluarsa');
      }

      // Parse token dan expiry timestamp
      const tokenParts = user.rememberToken.split('|');
      const storedToken = tokenParts[0];
      const expiryTimestamp = tokenParts[1] ? parseInt(tokenParts[1], 10) : null;

      // Validasi token match
      if (storedToken !== resetToken) {
        throw new BadRequestException('Token reset password tidak valid');
      }

      // Validasi expiry
      if (expiryTimestamp && Date.now() > expiryTimestamp) {
        user.rememberToken = null; // Clear expired token
        await this.userRepository.save(user);
        throw new BadRequestException('Token reset password sudah kadaluarsa. Silakan request reset password baru.');
      }
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
