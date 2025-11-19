import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('conversation_members')
export class ConversationMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversationId: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: ['admin', 'member'],
    default: 'member',
  })
  role: string;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastReadAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.members)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}

