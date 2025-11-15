import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';
import * as admin from 'firebase-admin';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { NotificationTemplate, TemplateType } from './entities/notification-template.entity';
import { WhatsAppService } from './services/whatsapp.service';
import { SMSProviderService } from './services/sms-provider.service';
import { NotificationChannelService } from './services/notification-channel.service';
import { NotificationLogService } from './services/notification-log.service';
import { ChannelType, ChannelProvider } from './entities/notification-channel.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: twilio.Twilio | null = null;
  private firebaseInitialized = false;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    private whatsappService: WhatsAppService,
    private smsProviderService: SMSProviderService,
    private channelService: NotificationChannelService,
    private logService: NotificationLogService,
  ) {
    this.initializeEmailTransporter();
    this.initializeTwilioClient();
    this.initializeFirebase();
    this.initializeProviders();
  }

  /**
   * Initialize providers from channel configurations
   */
  private async initializeProviders() {
    // This will be called per-tenant when needed
    // For now, we initialize global providers from env
    this.logger.log('Providers will be initialized per-tenant from channel configurations');
  }

  private initializeEmailTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          secure: smtpPort === '465', // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
        this.logger.log('Email transporter initialized successfully');
      } catch (error) {
        this.logger.warn('Failed to initialize email transporter', error.message);
      }
    } else {
      this.logger.warn('SMTP configuration not found. Email sending will be disabled.');
    }
  }

  private initializeTwilioClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      try {
        this.twilioClient = twilio(accountSid, authToken);
        this.logger.log('Twilio client initialized successfully');
      } catch (error) {
        this.logger.warn('Failed to initialize Twilio client', error.message);
      }
    } else {
      this.logger.warn('Twilio configuration not found. SMS sending will be disabled.');
    }
  }

  private initializeFirebase() {
    const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    const firebaseServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (firebaseServiceAccountPath) {
      // Option 1: Load from file path
      try {
        const serviceAccount = require(firebaseServiceAccountPath);
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        this.firebaseInitialized = true;
        this.logger.log('Firebase Admin initialized successfully from file path');
      } catch (error) {
        this.logger.warn('Failed to initialize Firebase Admin from file path', error.message);
      }
    } else if (firebaseServiceAccount) {
      // Option 2: Load from JSON string in environment variable
      try {
        const serviceAccount = JSON.parse(firebaseServiceAccount);
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        this.firebaseInitialized = true;
        this.logger.log('Firebase Admin initialized successfully from environment variable');
      } catch (error) {
        this.logger.warn('Failed to initialize Firebase Admin from environment variable', error.message);
      }
    } else {
      this.logger.warn('Firebase configuration not found. Push notifications will be disabled.');
    }
  }

  async sendEmail(
    instansiId: number,
    userId: number,
    recipient: string,
    subject: string,
    content: string,
    templateId?: number,
  ) {
    const notification = this.notificationRepository.create({
      instansiId,
      userId,
      type: NotificationType.EMAIL,
      title: subject,
      content,
      recipient,
      status: NotificationStatus.PENDING,
      templateId,
    });

    const saved = await this.notificationRepository.save(notification);

    try {
      if (this.emailTransporter) {
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
        await this.emailTransporter.sendMail({
          from: fromEmail,
          to: recipient,
          subject: subject,
          html: content,
        });
        this.logger.log(`Email sent successfully to ${recipient}`);
      } else {
        this.logger.warn('Email transporter not configured. Marking as sent without actually sending.');
      }

      saved.status = NotificationStatus.SENT;
      saved.sentAt = new Date();
      await this.notificationRepository.save(saved);
    } catch (error) {
      saved.status = NotificationStatus.FAILED;
      saved.sentAt = new Date();
      await this.notificationRepository.save(saved);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return saved;
  }

  async sendSMS(
    instansiId: number,
    userId: number,
    recipient: string,
    content: string,
    templateId?: number,
    channelId?: number,
  ) {
    const notification = this.notificationRepository.create({
      instansiId,
      userId,
      type: NotificationType.SMS,
      title: 'SMS Notification',
      content,
      recipient,
      status: NotificationStatus.PENDING,
      templateId,
      metadata: channelId ? { channelId } : undefined,
    });

    const saved = await this.notificationRepository.save(notification);
    let logEntry: any = null;

    try {
      // Try to get channel configuration first
      let channel = null;
      if (channelId) {
        const channels = await this.channelService.getActiveChannels(instansiId);
        channel = channels.find((c) => c.id === channelId) || null;
      } else {
        channel = await this.channelService.getActiveChannel(instansiId, ChannelType.SMS);
      }

      let smsResponse: any = null;

      if (channel) {
        // Use configured channel
        await this.initializeSMSProvider(channel);
        smsResponse = await this.sendSMSViaProvider(channel, recipient, content);
      } else {
        // Fallback to global Twilio config
        if (this.twilioClient) {
          const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
          if (!twilioPhoneNumber) {
            throw new Error('TWILIO_PHONE_NUMBER is not configured');
          }

          smsResponse = await this.smsProviderService.sendViaTwilio(
            { to: recipient, message: content },
            twilioPhoneNumber,
          );
        } else {
          throw new Error('No SMS provider configured');
        }
      }

      // Create log entry
      logEntry = await this.logService.createLog(
        saved.id,
        instansiId,
        NotificationType.SMS,
        smsResponse.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        {
          channelId: channel?.id,
          recipient,
          message: content,
          requestData: { to: recipient, message: content },
          responseData: smsResponse,
          errorMessage: smsResponse.error,
          providerMessageId: smsResponse.messageId,
          cost: smsResponse.cost,
          provider: smsResponse.provider,
        },
      );

      if (smsResponse.success) {
        saved.status = NotificationStatus.SENT;
        saved.sentAt = new Date();
        saved.metadata = {
          ...(saved.metadata || {}),
          messageId: smsResponse.messageId,
          provider: smsResponse.provider,
          cost: smsResponse.cost,
        };
        this.logger.log(`SMS sent successfully to ${recipient} via ${smsResponse.provider}`);
      } else {
        throw new Error(smsResponse.error || 'Failed to send SMS');
      }

      await this.notificationRepository.save(saved);
    } catch (error) {
      saved.status = NotificationStatus.FAILED;
      saved.sentAt = new Date();
      saved.errorMessage = error.message;
      await this.notificationRepository.save(saved);

      // Update log if created
      if (logEntry) {
        await this.logService.createLog(
          saved.id,
          instansiId,
          NotificationType.SMS,
          NotificationStatus.FAILED,
          {
            channelId: channelId,
            recipient,
            message: content,
            errorMessage: error.message,
          },
        );
      }

      throw new Error(`Failed to send SMS: ${error.message}`);
    }

    return saved;
  }

  /**
   * Initialize SMS provider from channel config
   */
  private async initializeSMSProvider(channel: any) {
    const { provider, config } = channel;

    switch (provider) {
      case ChannelProvider.TWILIO:
        this.smsProviderService.initializeTwilio(config.accountSid, config.authToken);
        break;
      case ChannelProvider.RAJA_SMS:
        this.smsProviderService.initializeRajaSMS(config.apiKey, config.apiUrl);
        break;
      case ChannelProvider.ZENZIVA:
        this.smsProviderService.initializeZenziva(config.userKey, config.passKey, config.apiUrl);
        break;
    }
  }

  /**
   * Send SMS via provider
   */
  private async sendSMSViaProvider(channel: any, recipient: string, content: string) {
    const { provider, config } = channel;

    switch (provider) {
      case ChannelProvider.TWILIO:
        return await this.smsProviderService.sendViaTwilio(
          { to: recipient, message: content },
          config.fromNumber || process.env.TWILIO_PHONE_NUMBER,
        );
      case ChannelProvider.RAJA_SMS:
        return await this.smsProviderService.sendViaRajaSMS(
          { to: recipient, message: content },
          config.senderId,
        );
      case ChannelProvider.ZENZIVA:
        return await this.smsProviderService.sendViaZenziva({ to: recipient, message: content });
      default:
        throw new Error(`Unsupported SMS provider: ${provider}`);
    }
  }

  async sendPush(
    instansiId: number,
    userId: number,
    deviceToken: string,
    title: string,
    content: string,
    templateId?: number,
  ) {
    const notification = this.notificationRepository.create({
      instansiId,
      userId,
      type: NotificationType.PUSH,
      title,
      content,
      recipient: deviceToken,
      status: NotificationStatus.PENDING,
      templateId,
    });

    const saved = await this.notificationRepository.save(notification);

    try {
      if (this.firebaseInitialized) {
        await admin.messaging().send({
          token: deviceToken,
          notification: {
            title: title,
            body: content,
          },
        });
        this.logger.log(`Push notification sent successfully to device ${deviceToken.substring(0, 10)}...`);
      } else {
        this.logger.warn('Firebase Admin not initialized. Marking as sent without actually sending.');
      }

      saved.status = NotificationStatus.SENT;
      saved.sentAt = new Date();
      await this.notificationRepository.save(saved);
    } catch (error) {
      saved.status = NotificationStatus.FAILED;
      saved.sentAt = new Date();
      await this.notificationRepository.save(saved);
      throw new Error(`Failed to send push notification: ${error.message}`);
    }

    return saved;
  }

  async sendInApp(
    instansiId: number,
    userId: number,
    title: string,
    content: string,
    templateId?: number,
  ) {
    const notification = this.notificationRepository.create({
      instansiId,
      userId,
      type: NotificationType.IN_APP,
      title,
      content,
      recipient: `user_${userId}`,
      status: NotificationStatus.SENT, // In-app notifications are immediately available
      templateId,
      sentAt: new Date(),
    });

    const saved = await this.notificationRepository.save(notification);

    // Emit real-time notification via WebSocket if gateway is available
    try {
      const { NotificationsGateway } = await import('./notifications.gateway');
      // Note: Gateway will be injected via module if needed
      this.logger.log(`In-app notification created for user ${userId}`);
    } catch (error) {
      // Gateway might not be available, that's okay
      this.logger.debug(`Could not emit real-time notification: ${error.message}`);
    }

    return saved;
  }

  async sendFromTemplate(
    instansiId: number,
    userId: number,
    templateId: number,
    recipient: string,
    variables: Record<string, string>,
  ) {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, instansiId, isActive: true },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    let content = template.content;
    // Replace variables
    if (template.variables) {
      template.variables.forEach((variable) => {
        const value = variables[variable] || '';
        content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      });
    }

    let subject = template.subject;
    if (template.variables) {
      template.variables.forEach((variable) => {
        const value = variables[variable] || '';
        subject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      });
    }

    switch (template.type) {
      case 'email':
        return this.sendEmail(instansiId, userId, recipient, subject, content, templateId);
      case 'sms':
        return this.sendSMS(instansiId, userId, recipient, content, templateId);
      case 'whatsapp':
        return this.sendWhatsApp(instansiId, userId, recipient, content, templateId);
      case 'push':
        return this.sendPush(instansiId, userId, recipient, subject, content, templateId);
      default:
        throw new Error('Unknown template type');
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(
    instansiId: number,
    userId: number,
    recipient: string,
    message: string,
    templateId?: number,
    channelId?: number,
    templateName?: string,
    templateParams?: Record<string, string>,
  ) {
    const notification = this.notificationRepository.create({
      instansiId,
      userId,
      type: NotificationType.WHATSAPP,
      title: 'WhatsApp Notification',
      content: message,
      recipient,
      status: NotificationStatus.PENDING,
      templateId,
      metadata: channelId ? { channelId } : undefined,
    });

    const saved = await this.notificationRepository.save(notification);
    let logEntry: any = null;

    try {
      // Try to get channel configuration
      let channel = null;
      if (channelId) {
        const channels = await this.channelService.getActiveChannels(instansiId);
        channel = channels.find((c) => c.id === channelId) || null;
      } else {
        channel = await this.channelService.getActiveChannel(instansiId, ChannelType.WHATSAPP);
      }

      let whatsappResponse: any = null;

      if (channel) {
        // Use configured channel
        await this.initializeWhatsAppProvider(channel);
        whatsappResponse = templateName
          ? await this.whatsappService.sendTemplateViaCloudAPI(recipient, templateName, templateParams || {})
          : await this.whatsappService.sendViaCloudAPI({ to: recipient, message });
      } else {
        // Fallback to global config
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        if (phoneNumberId && accessToken) {
          this.whatsappService.initializeCloudAPI(phoneNumberId, accessToken);
          whatsappResponse = templateName
            ? await this.whatsappService.sendTemplateViaCloudAPI(recipient, templateName, templateParams || {})
            : await this.whatsappService.sendViaCloudAPI({ to: recipient, message });
        } else {
          throw new Error('WhatsApp not configured');
        }
      }

      // Create log entry
      logEntry = await this.logService.createLog(
        saved.id,
        instansiId,
        NotificationType.WHATSAPP,
        whatsappResponse.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        {
          channelId: channel?.id,
          recipient,
          message: templateName ? `Template: ${templateName}` : message,
          requestData: { to: recipient, message, templateName, templateParams },
          responseData: whatsappResponse,
          errorMessage: whatsappResponse.error,
          providerMessageId: whatsappResponse.messageId,
          provider: whatsappResponse.provider,
        },
      );

      if (whatsappResponse.success) {
        saved.status = NotificationStatus.SENT;
        saved.sentAt = new Date();
        saved.metadata = {
          ...(saved.metadata || {}),
          messageId: whatsappResponse.messageId,
          provider: whatsappResponse.provider,
        };
        this.logger.log(`WhatsApp sent successfully to ${recipient} via ${whatsappResponse.provider}`);
      } else {
        throw new Error(whatsappResponse.error || 'Failed to send WhatsApp');
      }

      await this.notificationRepository.save(saved);
    } catch (error) {
      saved.status = NotificationStatus.FAILED;
      saved.sentAt = new Date();
      saved.errorMessage = error.message;
      await this.notificationRepository.save(saved);

      // Update log if created
      if (logEntry) {
        await this.logService.createLog(
          saved.id,
          instansiId,
          NotificationType.WHATSAPP,
          NotificationStatus.FAILED,
          {
            channelId: channelId,
            recipient,
            message,
            errorMessage: error.message,
          },
        );
      }

      throw new Error(`Failed to send WhatsApp: ${error.message}`);
    }

    return saved;
  }

  /**
   * Initialize WhatsApp provider from channel config
   */
  private async initializeWhatsAppProvider(channel: any) {
    const { provider, config } = channel;

    switch (provider) {
      case ChannelProvider.WHATSAPP_CLOUD_API:
        this.whatsappService.initializeCloudAPI(
          config.phoneNumberId,
          config.accessToken,
          config.apiVersion,
        );
        break;
      case ChannelProvider.WHATSAPP_BUSINESS:
        this.whatsappService.initializeBusinessAPI(config.apiUrl, config.apiKey);
        break;
      default:
        throw new Error(`Unsupported WhatsApp provider: ${provider}`);
    }
  }

  async getNotifications(
    instansiId: number,
    userId?: number,
    type?: NotificationType,
    status?: NotificationStatus,
  ) {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.instansiId = :instansiId', { instansiId });

    if (userId) {
      query.andWhere('notification.userId = :userId', { userId });
    }

    if (type) {
      query.andWhere('notification.type = :type', { type });
    }

    if (status) {
      query.andWhere('notification.status = :status', { status });
    }

    return await query.orderBy('notification.createdAt', 'DESC').getMany();
  }

  async getUserNotifications(
    userId: number,
    options?: { status?: 'unread' | 'read' | NotificationStatus; limit?: number },
  ) {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (options?.status) {
      if (options.status === 'unread') {
        query.andWhere('notification.readAt IS NULL');
      } else if (options.status === 'read') {
        query.andWhere('notification.readAt IS NOT NULL');
      } else {
        query.andWhere('notification.status = :status', { status: options.status });
      }
    }

    query.orderBy('notification.createdAt', 'DESC');

    if (options?.limit) {
      query.take(options.limit);
    }

    return await query.getMany();
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('readAt IS NULL')
      .execute();

    return { success: true };
  }

  async createTemplate(
    instansiId: number,
    name: string,
    type: string,
    subject: string,
    content: string,
    variables: string[],
  ) {
    const template = this.templateRepository.create({
      instansiId,
      name,
      type: type as TemplateType,
      subject,
      content,
      variables,
    });

    return await this.templateRepository.save(template);
  }

  async getTemplates(instansiId: number, isActive?: boolean) {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.instansiId = :instansiId', { instansiId });

    if (isActive !== undefined) {
      query.andWhere('template.isActive = :isActive', { isActive });
    }

    return await query.orderBy('template.createdAt', 'DESC').getMany();
  }
}

