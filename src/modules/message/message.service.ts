import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassRoom } from '../classes/entities/class-room.entity';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    private messagesGateway?: MessagesGateway,
  ) {}

  // Map priority from frontend format to database format
  private mapPriorityToDb(priority?: string): string {
    if (!priority) return 'normal';
    const mapping: Record<string, string> = {
      low: 'normal',
      medium: 'important',
      high: 'urgent',
    };
    return mapping[priority] || priority;
  }

  // Map priority from database format to frontend format
  private mapPriorityFromDb(priority: string): string {
    const mapping: Record<string, string> = {
      normal: 'low',
      important: 'medium',
      urgent: 'high',
    };
    return mapping[priority] || priority;
  }

  // Map status from database to frontend format
  private mapStatusFromDb(message: Message): 'unread' | 'read' | 'archived' {
    if (message.isArchived) return 'archived';
    if (message.isRead) return 'read';
    return 'unread';
  }

  async create(
    createDto: CreateMessageDto,
    instansiId: number,
    senderId: number,
  ) {
    const { recipient_type, recipient_id, receiverId, priority, ...rest } = createDto;
    
    // Determine receiverId
    let finalReceiverId: number | null = receiverId || recipient_id || null;
    const recipientType = recipient_type || (finalReceiverId ? 'user' : 'all');

    // Handle different recipient types
    let receiverIds: number[] = [];
    
    if (recipientType === 'user' && finalReceiverId) {
      receiverIds = [finalReceiverId];
    } else if (recipientType === 'class' && recipient_id) {
      // Get all students in the class
      const students = await this.studentRepository.find({
        where: { classId: recipient_id, instansiId, isActive: true },
      });
      receiverIds = students.map(s => s.id);
    } else if (recipientType === 'all') {
      // Get all active users in the instansi from users, students, and teachers tables
      const [users, students, teachers] = await Promise.all([
        this.userRepository.find({
          where: { instansiId, isActive: true },
        }),
        this.studentRepository.find({
          where: { instansiId, isActive: true },
        }),
        this.teacherRepository.find({
          where: { instansiId, isActive: true },
        }),
      ]);
      
      // Combine all IDs and filter out sender
      receiverIds = [
        ...users.map(u => u.id),
        ...students.map(s => s.id),
        ...teachers.map(t => t.id),
      ].filter(id => id !== senderId);
    } else {
      throw new BadRequestException('Penerima tidak valid');
    }

    if (receiverIds.length === 0) {
      throw new BadRequestException('Tidak ada penerima yang ditemukan');
    }

    // Create messages for all receivers
    const messages = receiverIds.map(receiverId => {
      return this.messageRepository.create({
        ...rest,
        receiverId,
        instansiId,
        senderId,
        priority: this.mapPriorityToDb(priority),
      });
    });

    const savedMessages = await this.messageRepository.save(messages);
    
    // Send real-time notifications to all receivers
    if (this.messagesGateway) {
      for (const savedMessage of savedMessages) {
        const formattedMessage = await this.formatMessageResponse(savedMessage);
        await this.messagesGateway.notifyNewMessage(savedMessage.receiverId, formattedMessage);
        
        // Update unread count for receiver
        const unreadCount = await this.getUnreadCount(savedMessage.instansiId, savedMessage.receiverId);
        await this.messagesGateway.updateUnreadCount(savedMessage.receiverId, unreadCount);
      }
    }
    
    // Return first message with formatted response
    return this.formatMessageResponse(savedMessages[0]);
  }

  // Format message response for frontend
  private async formatMessageResponse(message: Message): Promise<any> {
    const [sender, receiver] = await Promise.all([
      this.getUserInfo(message.senderId),
      this.getUserInfo(message.receiverId),
    ]);

    return {
      id: message.id,
      subject: message.subject,
      content: message.content,
      sender_id: message.senderId,
      sender_name: sender?.name || '-',
      recipient_id: message.receiverId,
      recipient_name: receiver?.name || '-',
      recipient_type: 'user',
      status: this.mapStatusFromDb(message),
      priority: this.mapPriorityFromDb(message.priority),
      created_at: message.createdAt,
      read_at: message.readAt,
    };
  }

  // Get user info (from users, students, or teachers table)
  private async getUserInfo(userId: number): Promise<{ name: string } | null> {
    // Try users table first
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) return { name: user.name };

    // Try students table
    const student = await this.studentRepository.findOne({ where: { id: userId } });
    if (student) return { name: student.name };

    // Try teachers table
    const teacher = await this.teacherRepository.findOne({ where: { id: userId } });
    if (teacher) return { name: teacher.name };

    return null;
  }

  async findAll(filters: {
    instansiId: number;
    userId: number;
    type?: 'inbox' | 'sent' | 'archived';
    isRead?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      instansiId,
      userId,
      type = 'inbox',
      isRead,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.instansiId = :instansiId', { instansiId })
      .orderBy('message.createdAt', 'DESC');

    if (type === 'inbox') {
      queryBuilder.andWhere('message.receiverId = :userId', { userId });
    } else if (type === 'sent') {
      queryBuilder.andWhere('message.senderId = :userId', { userId });
    } else if (type === 'archived') {
      queryBuilder.andWhere(
        '(message.receiverId = :userId OR message.senderId = :userId)',
        { userId },
      );
      queryBuilder.andWhere('message.isArchived = :isArchived', {
        isArchived: true,
      });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('message.isRead = :isRead', { isRead });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Format all messages
    const formattedData = await Promise.all(
      data.map(msg => this.formatMessageResponse(msg))
    );

    return {
      data: formattedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, instansiId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id, instansiId },
      relations: ['parent', 'replies'],
    });

    if (!message) {
      throw new NotFoundException(`Pesan dengan ID ${id} tidak ditemukan`);
    }

    // Check access
    if (
      message.senderId !== userId &&
      message.receiverId !== userId
    ) {
      throw new NotFoundException('Anda tidak memiliki akses ke pesan ini');
    }

    // Mark as read if receiver
    if (message.receiverId === userId && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await this.messageRepository.save(message);
    }

    return this.formatMessageResponse(message);
  }

  async markAsRead(id: number, instansiId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id, instansiId, receiverId: userId },
    });

    if (!message) {
      throw new NotFoundException(`Pesan dengan ID ${id} tidak ditemukan`);
    }

    const wasUnread = !message.isRead;
    message.isRead = true;
    message.readAt = new Date();
    const saved = await this.messageRepository.save(message);
    
    // Notify sender that message was read
    if (this.messagesGateway && wasUnread && message.senderId !== userId) {
      await this.messagesGateway.notifyMessageRead(message.senderId, id, userId);
    }
    
    // Update unread count for receiver
    if (this.messagesGateway) {
      const unreadCount = await this.getUnreadCount(instansiId, userId);
      await this.messagesGateway.updateUnreadCount(userId, unreadCount);
    }
    
    return this.formatMessageResponse(saved);
  }

  async archive(id: number, instansiId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id, instansiId },
    });

    if (!message) {
      throw new NotFoundException(`Pesan dengan ID ${id} tidak ditemukan`);
    }

    if (
      message.senderId !== userId &&
      message.receiverId !== userId
    ) {
      throw new NotFoundException('Anda tidak memiliki akses ke pesan ini');
    }

    message.isArchived = true;
    message.archivedAt = new Date();
    const saved = await this.messageRepository.save(message);
    
    // Notify user about archived message
    if (this.messagesGateway) {
      await this.messagesGateway.notifyMessageArchived(userId, id);
    }
    
    return this.formatMessageResponse(saved);
  }

  async remove(id: number, instansiId: number, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id, instansiId },
    });

    if (!message) {
      throw new NotFoundException(`Pesan dengan ID ${id} tidak ditemukan`);
    }

    // Only sender or receiver can delete
    if (
      message.senderId !== userId &&
      message.receiverId !== userId
    ) {
      throw new NotFoundException('Anda tidak memiliki akses ke pesan ini');
    }

    await this.messageRepository.remove(message);
    
    // Notify user about deleted message
    if (this.messagesGateway) {
      await this.messagesGateway.notifyMessageDeleted(userId, id);
      
      // Update unread count if message was unread
      if (!message.isRead && message.receiverId === userId) {
        const unreadCount = await this.getUnreadCount(instansiId, userId);
        await this.messagesGateway.updateUnreadCount(userId, unreadCount);
      }
    }
    
    return { message: 'Pesan berhasil dihapus' };
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(instansiId: number, userId: number): Promise<number> {
    return await this.messageRepository.count({
      where: {
        instansiId,
        receiverId: userId,
        isRead: false,
        isArchived: false,
        isActive: true,
      },
    });
  }

  /**
   * Get unread count for inbox
   */
  async getInboxUnreadCount(instansiId: number, userId: number): Promise<number> {
    return this.getUnreadCount(instansiId, userId);
  }
}

