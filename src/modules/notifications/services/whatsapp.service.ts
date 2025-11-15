import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ChannelProvider } from '../entities/notification-channel.entity';

export interface WhatsAppMessage {
  to: string;
  message: string;
  templateId?: string;
  templateParams?: Record<string, string>;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: ChannelProvider;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private cloudApiClient: AxiosInstance | null = null;
  private businessApiClient: AxiosInstance | null = null;

  /**
   * Initialize WhatsApp Cloud API client
   */
  initializeCloudAPI(phoneNumberId: string, accessToken: string, apiVersion = 'v21.0') {
    try {
      this.cloudApiClient = axios.create({
        baseURL: `https://graph.facebook.com/${apiVersion}/${phoneNumberId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      this.logger.log('WhatsApp Cloud API client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp Cloud API', error);
    }
  }

  /**
   * Initialize WhatsApp Business API client (alternative)
   */
  initializeBusinessAPI(apiUrl: string, apiKey: string) {
    try {
      this.businessApiClient = axios.create({
        baseURL: apiUrl,
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      this.logger.log('WhatsApp Business API client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp Business API', error);
    }
  }

  /**
   * Send WhatsApp message via Cloud API
   */
  async sendViaCloudAPI(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    if (!this.cloudApiClient) {
      throw new Error('WhatsApp Cloud API client not initialized');
    }

    try {
      // Format nomor telepon (pastikan format internasional)
      const phoneNumber = this.formatPhoneNumber(message.to);

      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message.message,
        },
      };

      const response = await this.cloudApiClient.post('/messages', payload);

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        provider: ChannelProvider.WHATSAPP_CLOUD_API,
      };
    } catch (error: any) {
      this.logger.error('Failed to send WhatsApp via Cloud API', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        provider: ChannelProvider.WHATSAPP_CLOUD_API,
      };
    }
  }

  /**
   * Send WhatsApp message via Business API
   */
  async sendViaBusinessAPI(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    if (!this.businessApiClient) {
      throw new Error('WhatsApp Business API client not initialized');
    }

    try {
      const phoneNumber = this.formatPhoneNumber(message.to);

      const payload = {
        to: phoneNumber,
        message: message.message,
        templateId: message.templateId,
        templateParams: message.templateParams,
      };

      const response = await this.businessApiClient.post('/send', payload);

      return {
        success: true,
        messageId: response.data.messageId || response.data.id,
        provider: ChannelProvider.WHATSAPP_BUSINESS,
      };
    } catch (error: any) {
      this.logger.error('Failed to send WhatsApp via Business API', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        provider: ChannelProvider.WHATSAPP_BUSINESS,
      };
    }
  }

  /**
   * Send WhatsApp message using template (Cloud API)
   */
  async sendTemplateViaCloudAPI(
    to: string,
    templateName: string,
    templateParams: Record<string, string>,
    languageCode = 'id',
  ): Promise<WhatsAppResponse> {
    if (!this.cloudApiClient) {
      throw new Error('WhatsApp Cloud API client not initialized');
    }

    try {
      const phoneNumber = this.formatPhoneNumber(to);

      // Format template parameters
      const components = [];
      if (Object.keys(templateParams).length > 0) {
        components.push({
          type: 'body',
          parameters: Object.entries(templateParams).map(([key, value]) => ({
            type: 'text',
            text: value,
          })),
        });
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components.length > 0 ? components : undefined,
        },
      };

      const response = await this.cloudApiClient.post('/messages', payload);

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        provider: ChannelProvider.WHATSAPP_CLOUD_API,
      };
    } catch (error: any) {
      this.logger.error('Failed to send WhatsApp template via Cloud API', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        provider: ChannelProvider.WHATSAPP_CLOUD_API,
      };
    }
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.length < 8) {
      throw new Error('Phone number is too short');
    }

    // If starts with 0, replace with country code (Indonesia: 62)
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    // If doesn't start with country code, add it
    else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }

    return cleaned;
  }

  /**
   * Verify webhook signature (for WhatsApp Cloud API)
   */
  verifyWebhookSignature(payload: string, signature: string, appSecret: string): boolean {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
    return hash === signature;
  }
}

