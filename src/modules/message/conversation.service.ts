import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationMember } from './entities/conversation-member.entity';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationMember)
    private memberRepository: Repository<ConversationMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  async create(
    name: string,
    instansiId: number,
    createdBy: number,
    memberIds: number[],
    description?: string,
  ) {
    // Validate name
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Nama grup tidak boleh kosong');
    }

    // Validate members
    if (!memberIds || memberIds.length === 0) {
      throw new BadRequestException('Minimal harus ada 1 anggota');
    }

    // Remove duplicates
    const uniqueMemberIds = [...new Set(memberIds)];

    // Add creator to members if not included
    if (!uniqueMemberIds.includes(createdBy)) {
      uniqueMemberIds.push(createdBy);
    }

    // Create conversation
    const conversation = this.conversationRepository.create({
      name,
      description,
      instansiId,
      createdBy,
      type: uniqueMemberIds.length > 2 ? 'group' : 'direct',
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    // Create members
    const members = uniqueMemberIds.map((userId) => {
      return this.memberRepository.create({
        conversationId: savedConversation.id,
        userId,
        role: userId === createdBy ? 'admin' : 'member',
      });
    });

    await this.memberRepository.save(members);

    return this.findOne(savedConversation.id, instansiId, createdBy);
  }

  async findAll(instansiId: number, userId: number) {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.members', 'member')
      .where('conversation.instansiId = :instansiId', { instansiId })
      .andWhere('member.userId = :userId', { userId })
      .andWhere('member.isActive = :isActive', { isActive: true })
      .andWhere('conversation.isActive = :convActive', { convActive: true })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    // Format conversations with member info
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const members = await this.memberRepository.find({
          where: { conversationId: conv.id, isActive: true },
        });

        const memberInfo = await Promise.all(
          members.map(async (member) => {
            const userInfo = await this.getUserInfo(member.userId);
            return {
              id: member.id,
              userId: member.userId,
              userName: userInfo?.name || '-',
              role: member.role,
              isMuted: member.isMuted,
              lastReadAt: member.lastReadAt,
            };
          }),
        );

        return {
          id: conv.id,
          name: conv.name,
          description: conv.description,
          type: conv.type,
          createdBy: conv.createdBy,
          members: memberInfo,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      }),
    );

    return formattedConversations;
  }

  async findOne(id: number, instansiId: number, userId: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id, instansiId },
      relations: ['members'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation tidak ditemukan');
    }

    // Check if user is member
    const member = await this.memberRepository.findOne({
      where: { conversationId: id, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('Anda bukan anggota conversation ini');
    }

    // Get member info
    const members = await this.memberRepository.find({
      where: { conversationId: id, isActive: true },
    });

    const memberInfo = await Promise.all(
      members.map(async (m) => {
        const userInfo = await this.getUserInfo(m.userId);
        return {
          id: m.id,
          userId: m.userId,
          userName: userInfo?.name || '-',
          role: m.role,
          isMuted: m.isMuted,
          lastReadAt: m.lastReadAt,
        };
      }),
    );

    return {
      id: conversation.id,
      name: conversation.name,
      description: conversation.description,
      type: conversation.type,
      createdBy: conversation.createdBy,
      members: memberInfo,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async addMembers(
    conversationId: number,
    instansiId: number,
    userId: number,
    newMemberIds: number[],
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, instansiId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation tidak ditemukan');
    }

    // Check if user is admin
    const member = await this.memberRepository.findOne({
      where: { conversationId, userId, isActive: true },
    });

    if (!member || member.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa menambah anggota');
    }

    // Check existing members
    const existingMembers = await this.memberRepository.find({
      where: { conversationId, isActive: true },
    });

    const existingUserIds = existingMembers.map((m) => m.userId);
    const toAdd = newMemberIds.filter((id) => !existingUserIds.includes(id));

    if (toAdd.length === 0) {
      throw new BadRequestException('Semua user sudah menjadi anggota');
    }

    // Add new members
    const newMembers = toAdd.map((userId) => {
      return this.memberRepository.create({
        conversationId,
        userId,
        role: 'member',
      });
    });

    await this.memberRepository.save(newMembers);

    // Update conversation type if needed
    const totalMembers = existingMembers.length + newMembers.length;
    if (totalMembers > 2 && conversation.type === 'direct') {
      conversation.type = 'group';
      await this.conversationRepository.save(conversation);
    }

    return this.findOne(conversationId, instansiId, userId);
  }

  async removeMember(
    conversationId: number,
    instansiId: number,
    userId: number,
    memberUserId: number,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, instansiId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation tidak ditemukan');
    }

    // Check if user is admin or removing themselves
    const member = await this.memberRepository.findOne({
      where: { conversationId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('Anda bukan anggota conversation ini');
    }

    if (memberUserId !== userId && member.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa mengeluarkan anggota');
    }

    // Remove member
    const memberToRemove = await this.memberRepository.findOne({
      where: { conversationId, userId: memberUserId, isActive: true },
    });

    if (!memberToRemove) {
      throw new NotFoundException('Anggota tidak ditemukan');
    }

    memberToRemove.isActive = false;
    await this.memberRepository.save(memberToRemove);

    return { message: 'Anggota berhasil dikeluarkan' };
  }

  async update(
    id: number,
    instansiId: number,
    userId: number,
    updates: { name?: string; description?: string },
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id, instansiId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation tidak ditemukan');
    }

    // Check if user is admin
    const member = await this.memberRepository.findOne({
      where: { conversationId: id, userId, isActive: true },
    });

    if (!member || member.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa mengupdate conversation');
    }

    if (updates.name) conversation.name = updates.name;
    if (updates.description !== undefined) conversation.description = updates.description;

    await this.conversationRepository.save(conversation);

    return this.findOne(id, instansiId, userId);
  }

  async delete(id: number, instansiId: number, userId: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id, instansiId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation tidak ditemukan');
    }

    // Check if user is admin
    const member = await this.memberRepository.findOne({
      where: { conversationId: id, userId, isActive: true },
    });

    if (!member || member.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa menghapus conversation');
    }

    conversation.isActive = false;
    await this.conversationRepository.save(conversation);

    // Deactivate all members
    await this.memberRepository.update(
      { conversationId: id },
      { isActive: false },
    );

    return { message: 'Conversation berhasil dihapus' };
  }

  // Get user info (from users, students, or teachers table)
  private async getUserInfo(userId: number): Promise<{ name: string } | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) return { name: user.name };

    const student = await this.studentRepository.findOne({ where: { id: userId } });
    if (student) return { name: student.name };

    const teacher = await this.teacherRepository.findOne({ where: { id: userId } });
    if (teacher) return { name: teacher.name };

    return null;
  }
}

