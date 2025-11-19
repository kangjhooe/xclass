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
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  tenantId?: number;
}

interface MessageNotification {
  id: number;
  subject: string;
  content: string;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
  recipient_name: string;
  priority: string;
  status: string;
  created_at: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(private jwtService: JwtService) {}

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
      this.logger.log(
        `Messages client ${client.id} connected (User: ${client.userId}, Tenant: ${client.tenantId})`,
      );

      // Join user-specific room for receiving messages
      client.join(`user:${client.userId}`);
      if (client.tenantId) {
        client.join(`tenant:${client.tenantId}`);
      }

      // Send unread count on connection
      this.sendUnreadCount(client);
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Messages client ${client.id} disconnected`);
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // Try to get token from handshake auth
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (token) {
      return token.startsWith('Bearer ') ? token.substring(7) : token;
    }
    return null;
  }

  /**
   * Send new message notification to receiver
   */
  async notifyNewMessage(receiverId: number, message: MessageNotification) {
    this.server.to(`user:${receiverId}`).emit('newMessage', message);
    this.logger.log(`New message notification sent to user ${receiverId}`);
  }

  /**
   * Send message read notification to sender
   */
  async notifyMessageRead(senderId: number, messageId: number, readBy: number) {
    this.server.to(`user:${senderId}`).emit('messageRead', {
      messageId,
      readBy,
      readAt: new Date(),
    });
  }

  /**
   * Send unread count update to user
   */
  async sendUnreadCount(client: AuthenticatedSocket, count?: number) {
    if (!client.userId) return;
    
    // If count is provided, use it; otherwise emit event for client to fetch
    if (count !== undefined) {
      client.emit('unreadCount', { count });
    } else {
      client.emit('fetchUnreadCount');
    }
  }

  /**
   * Update unread count for specific user
   */
  async updateUnreadCount(userId: number, count: number) {
    this.server.to(`user:${userId}`).emit('unreadCount', { count });
  }

  /**
   * Notify message deleted
   */
  async notifyMessageDeleted(userId: number, messageId: number) {
    this.server.to(`user:${userId}`).emit('messageDeleted', { messageId });
  }

  /**
   * Notify message archived
   */
  async notifyMessageArchived(userId: number, messageId: number) {
    this.server.to(`user:${userId}`).emit('messageArchived', { messageId });
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }
    // Client should fetch from API, this just triggers the request
    return { success: true };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: number },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }
    // This will be handled by the service, just acknowledge
    return { success: true, messageId: data.messageId };
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

