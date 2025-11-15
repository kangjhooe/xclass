import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationChannel, ChannelType, ChannelProvider } from '../entities/notification-channel.entity';

@Injectable()
export class NotificationChannelService {
  private readonly logger = new Logger(NotificationChannelService.name);

  constructor(
    @InjectRepository(NotificationChannel)
    private channelRepository: Repository<NotificationChannel>,
  ) {}

  /**
   * Get active channel for a specific type
   */
  async getActiveChannel(instansiId: number, type: ChannelType): Promise<NotificationChannel | null> {
    const channel = await this.channelRepository.findOne({
      where: {
        instansiId,
        type,
        isActive: true,
      },
      order: {
        isDefault: 'DESC',
        priority: 'ASC',
      },
    });

    return channel || null;
  }

  /**
   * Get all active channels for a tenant
   */
  async getActiveChannels(instansiId: number): Promise<NotificationChannel[]> {
    return await this.channelRepository.find({
      where: {
        instansiId,
        isActive: true,
      },
      order: {
        type: 'ASC',
        priority: 'ASC',
      },
    });
  }

  /**
   * Create or update channel configuration
   */
  async upsertChannel(
    instansiId: number,
    name: string,
    type: ChannelType,
    provider: ChannelProvider,
    config: Record<string, any>,
    options?: {
      isActive?: boolean;
      isDefault?: boolean;
      priority?: number;
      description?: string;
    },
  ): Promise<NotificationChannel> {
    // Validate config based on provider
    this.validateChannelConfig(type, provider, config);

    // Check if channel with same name exists
    let channel = await this.channelRepository.findOne({
      where: {
        instansiId,
        name,
      },
    });

    if (channel) {
      // Update existing
      channel.type = type;
      channel.provider = provider;
      channel.config = config;
      channel.isActive = options?.isActive ?? channel.isActive;
      channel.isDefault = options?.isDefault ?? channel.isDefault;
      channel.priority = options?.priority ?? channel.priority;
      channel.description = options?.description ?? channel.description;
    } else {
      // Create new
      channel = this.channelRepository.create({
        instansiId,
        name,
        type,
        provider,
        config,
        isActive: options?.isActive ?? true,
        isDefault: options?.isDefault ?? false,
        priority: options?.priority ?? 0,
        description: options?.description,
      });
    }

    // If this is set as default, unset other defaults of same type
    if (channel.isDefault) {
      await this.channelRepository.update(
        {
          instansiId,
          type,
          isDefault: true,
        },
        {
          isDefault: false,
        },
      );
    }

    return await this.channelRepository.save(channel);
  }

  /**
   * Deactivate channel
   */
  async deactivateChannel(instansiId: number, channelId: number): Promise<void> {
    await this.channelRepository.update(
      {
        id: channelId,
        instansiId,
      },
      {
        isActive: false,
      },
    );
  }

  /**
   * Delete channel
   */
  async deleteChannel(instansiId: number, channelId: number): Promise<void> {
    await this.channelRepository.delete({
      id: channelId,
      instansiId,
    });
  }

  /**
   * Validate channel configuration based on provider
   */
  private validateChannelConfig(
    type: ChannelType,
    provider: ChannelProvider,
    config: Record<string, any>,
  ): void {
    if (type === ChannelType.SMS) {
      if (provider === ChannelProvider.TWILIO) {
        if (!config.accountSid || !config.authToken) {
          throw new Error('Twilio requires accountSid and authToken');
        }
      } else if (provider === ChannelProvider.RAJA_SMS) {
        if (!config.apiKey) {
          throw new Error('Raja SMS requires apiKey');
        }
      } else if (provider === ChannelProvider.ZENZIVA) {
        if (!config.userKey || !config.passKey) {
          throw new Error('Zenziva requires userKey and passKey');
        }
      }
    } else if (type === ChannelType.WHATSAPP) {
      if (provider === ChannelProvider.WHATSAPP_CLOUD_API) {
        if (!config.phoneNumberId || !config.accessToken) {
          throw new Error('WhatsApp Cloud API requires phoneNumberId and accessToken');
        }
      } else if (provider === ChannelProvider.WHATSAPP_BUSINESS) {
        if (!config.apiUrl || !config.apiKey) {
          throw new Error('WhatsApp Business API requires apiUrl and apiKey');
        }
      }
    }
  }
}

