import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
