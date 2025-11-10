import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SystemSetting } from './entities/system-setting.entity';

@Controller('admin/system-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.systemSettingsService.findAll(category);
  }

  @Get('categories')
  getCategories() {
    return this.systemSettingsService.getCategories();
  }

  @Get('category/:category')
  getByCategory(@Param('category') category: string) {
    return this.systemSettingsService.getByCategory(category);
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.systemSettingsService.findOne(key);
  }

  @Get(':key/value')
  getValue(@Param('key') key: string, @Query('default') defaultValue?: string) {
    return this.systemSettingsService.getValue(key, defaultValue);
  }

  @Post()
  create(@Body() createData: Partial<SystemSetting>) {
    return this.systemSettingsService.create(createData);
  }

  @Put(':key')
  update(@Param('key') key: string, @Body() updateData: Partial<SystemSetting>) {
    return this.systemSettingsService.update(key, updateData);
  }

  @Post(':key/set')
  setValue(
    @Param('key') key: string,
    @Body() body: { value: any; type?: string },
  ) {
    return this.systemSettingsService.setValue(key, body.value, body.type);
  }

  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.systemSettingsService.delete(key);
  }
}

