import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansiId: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  conversationId: number;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ['normal', 'urgent', 'important'],
    default: 'normal',
  })
  priority: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'datetime', nullable: true })
  readAt: Date;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ type: 'datetime', nullable: true })
  archivedAt: Date;

  @Column({ type: 'json', nullable: true })
  attachments: string[] | string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Message, (message) => message.replies)
  @JoinColumn({ name: 'parent_id' })
  parent: Message;

  @OneToMany(() => Message, (message) => message.parent)
  replies: Message[];
}

