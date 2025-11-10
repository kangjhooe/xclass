import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookLoan } from './book-loan.entity';

export enum BookStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  MAINTENANCE = 'maintenance',
  LOST = 'lost',
  DAMAGED = 'damaged',
}

export enum BookCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  isbn: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  publisher: string;

  @Column({ type: 'int', nullable: true })
  publicationYear: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ default: 'id' })
  language: string;

  @Column({ type: 'int', nullable: true })
  pages: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'int', default: 1 })
  totalCopies: number;

  @Column({ type: 'int', default: 1 })
  availableCopies: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  shelfNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @Column({
    type: 'enum',
    enum: BookCondition,
    nullable: true,
  })
  condition: BookCondition;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ nullable: true })
  donor: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  pdfFile: string;

  @Column({ nullable: true })
  pdfFileName: string;

  @Column({ type: 'int', nullable: true })
  pdfFileSize: number;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  allowDownload: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BookLoan, (loan) => loan.book)
  loans: BookLoan[];
}

