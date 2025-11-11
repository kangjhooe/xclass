import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  tenantId?: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Authenticate client using JWT token
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;
      client.tenantId = payload.tenantId || payload.instansiId;

      this.connectedClients.set(client.id, client);
      this.logger.log(`Client ${client.id} connected (User: ${client.userId}, Tenant: ${client.tenantId})`);

      // Join user-specific room
      client.join(`user:${client.userId}`);
      if (client.tenantId) {
        client.join(`tenant:${client.tenantId}`);
      }

      // Send pending notifications
      await this.sendPendingNotifications(client);
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // Try to get token from handshake auth
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (token) {
      return token.startsWith('Bearer ') ? token.substring(7) : token;
    }
    return null;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: number },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.notificationsService.markAsRead(data.notificationId, client.userId);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking notification as read:`, error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      await this.notificationsService.markAllAsRead(client.userId);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking all notifications as read:`, error);
      return { error: error.message };
    }
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const notifications = await this.notificationsService.getUserNotifications(client.userId);
      return { notifications };
    } catch (error) {
      this.logger.error(`Error getting notifications:`, error);
      return { error: error.message };
    }
  }

  /**
   * Send notification to specific user
   */
  async sendToUser(userId: number, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Send notification to all users in a tenant
   */
  async sendToTenant(tenantId: number, notification: any) {
    this.server.to(`tenant:${tenantId}`).emit('notification', notification);
  }

  /**
   * Send notification to all connected clients
   */
  async broadcast(notification: any) {
    this.server.emit('notification', notification);
  }

  /**
   * Send pending notifications when user connects
   */
  private async sendPendingNotifications(client: AuthenticatedSocket) {
    if (!client.userId) return;

    try {
      const notifications = await this.notificationsService.getUserNotifications(client.userId, {
        status: 'unread',
        limit: 10,
      });

      if (notifications.length > 0) {
        client.emit('notifications', notifications);
      }
    } catch (error) {
      this.logger.error(`Error sending pending notifications:`, error);
    }
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

