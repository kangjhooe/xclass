import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';
import * as admin from 'firebase-admin';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { NotificationTemplate, TemplateType } from './entities/notification-template.entity';

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
  ) {
    this.initializeEmailTransporter();
    this.initializeTwilioClient();
    this.initializeFirebase();
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
    });

    const saved = await this.notificationRepository.save(notification);

    try {
      if (this.twilioClient) {
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
        if (!twilioPhoneNumber) {
          throw new Error('TWILIO_PHONE_NUMBER is not configured');
        }

        await this.twilioClient.messages.create({
          body: content,
          from: twilioPhoneNumber,
          to: recipient,
        });
        this.logger.log(`SMS sent successfully to ${recipient}`);
      } else {
        this.logger.warn('Twilio client not configured. Marking as sent without actually sending.');
      }

      saved.status = NotificationStatus.SENT;
      saved.sentAt = new Date();
      await this.notificationRepository.save(saved);
    } catch (error) {
      saved.status = NotificationStatus.FAILED;
      saved.sentAt = new Date();
      await this.notificationRepository.save(saved);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }

    return saved;
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
      case 'push':
        return this.sendPush(instansiId, userId, recipient, subject, content, templateId);
      default:
        throw new Error('Unknown template type');
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

