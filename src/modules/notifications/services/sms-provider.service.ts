import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as twilio from 'twilio';
import { ChannelProvider } from '../entities/notification-channel.entity';

export interface SMSMessage {
  to: string;
  message: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: ChannelProvider;
  cost?: number;
}

@Injectable()
export class SMSProviderService {
  private readonly logger = new Logger(SMSProviderService.name);
  private twilioClient: twilio.Twilio | null = null;
  private rajaSMSClient: AxiosInstance | null = null;
  private zenzivaClient: AxiosInstance | null = null;

  /**
   * Initialize Twilio client
   */
  initializeTwilio(accountSid: string, authToken: string) {
    try {
      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio', error);
    }
  }

  /**
   * Initialize Raja SMS client
   */
  initializeRajaSMS(apiKey: string, apiUrl = 'https://api.raja-sms.com') {
    try {
      this.rajaSMSClient = axios.create({
        baseURL: apiUrl,
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      this.logger.log('Raja SMS client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Raja SMS', error);
    }
  }

  /**
   * Initialize Zenziva client
   */
  initializeZenziva(userKey: string, passKey: string, apiUrl = 'https://console.zenziva.net') {
    try {
      this.zenzivaClient = axios.create({
        baseURL: apiUrl,
        params: {
          userkey: userKey,
          passkey: passKey,
        },
      });
      this.logger.log('Zenziva client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Zenziva', error);
    }
  }

  /**
   * Send SMS via Twilio
   */
  async sendViaTwilio(message: SMSMessage, fromNumber: string): Promise<SMSResponse> {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const phoneNumber = this.formatPhoneNumber(message.to);

      const result = await this.twilioClient.messages.create({
        body: message.message,
        from: fromNumber,
        to: phoneNumber,
      });

      return {
        success: true,
        messageId: result.sid,
        provider: ChannelProvider.TWILIO,
        cost: parseFloat(result.price || '0'),
      };
    } catch (error: any) {
      this.logger.error('Failed to send SMS via Twilio', error.message);
      return {
        success: false,
        error: error.message,
        provider: ChannelProvider.TWILIO,
      };
    }
  }

  /**
   * Send SMS via Raja SMS
   */
  async sendViaRajaSMS(message: SMSMessage, senderId?: string): Promise<SMSResponse> {
    if (!this.rajaSMSClient) {
      throw new Error('Raja SMS client not initialized');
    }

    try {
      const phoneNumber = this.formatPhoneNumber(message.to);

      const payload = {
        to: phoneNumber,
        message: message.message,
        sender: senderId || 'XCLASS',
      };

      const response = await this.rajaSMSClient.post('/send', payload);

      return {
        success: response.data.status === 'success',
        messageId: response.data.messageId || response.data.id,
        provider: ChannelProvider.RAJA_SMS,
        cost: response.data.cost || 0,
      };
    } catch (error: any) {
      this.logger.error('Failed to send SMS via Raja SMS', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        provider: ChannelProvider.RAJA_SMS,
      };
    }
  }

  /**
   * Send SMS via Zenziva
   */
  async sendViaZenziva(message: SMSMessage): Promise<SMSResponse> {
    if (!this.zenzivaClient) {
      throw new Error('Zenziva client not initialized');
    }

    try {
      const phoneNumber = this.formatPhoneNumber(message.to);

      const response = await this.zenzivaClient.post('/reguler/api/sendsms/', null, {
        params: {
          tujuan: phoneNumber,
          pesan: message.message,
        },
      });

      const data = response.data;
      const success = data.status === '1' || data.status === 1;

      return {
        success,
        messageId: data.messageId || data.id,
        provider: ChannelProvider.ZENZIVA,
        cost: data.cost || 0,
      };
    } catch (error: any) {
      this.logger.error('Failed to send SMS via Zenziva', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        provider: ChannelProvider.ZENZIVA,
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
}

