import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterPpdbDto } from './dto/register-ppdb.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 requests per minute for login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      console.log('Login request received:', { email: loginDto.email });
      const result = await this.authService.login(loginDto);
      console.log('Login successful for:', loginDto.email);
      return result;
    } catch (error) {
      console.error('Login error:', error.message);
      // Re-throw the error to let NestJS handle it
      throw error;
    }
  }

  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 requests per minute for register
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      console.log('Register successful for:', registerDto.email);
      return result;
    } catch (error) {
      console.error('Register error:', error.message);
      throw error;
    }
  }

  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 requests per minute for PPDB register
  @Post('register-ppdb')
  async registerPpdb(@Body() registerDto: RegisterPpdbDto) {
    try {
      const result = await this.authService.registerPpdb(registerDto);
      console.log('Register PPDB successful for:', registerDto.email);
      return result;
    } catch (error) {
      console.error('Register PPDB error:', error.message);
      throw error;
    }
  }

  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 requests per minute for forgot password
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 requests per minute for reset password
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.newPassword,
      resetPasswordDto.confirmPassword,
      resetPasswordDto.resetToken,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
