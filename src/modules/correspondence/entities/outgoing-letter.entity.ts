import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LetterActivityLog } from './letter-activity-log.entity';
import { LetterTemplate } from './letter-template.entity';

export enum OutgoingLetterStatus {
  DRAFT = 'draft',
  MENUNGGU_TTD = 'menunggu_ttd',
  TERKIRIM = 'terkirim',
  ARSIP = 'arsip',
}

export enum LetterPriority {
  RENDAH = 'rendah',
  SEDANG = 'sedang',
  TINGGI = 'tinggi',
  SANGAT_TINGGI = 'sangat_tinggi',
}

export enum LetterNature {
  BIASA = 'biasa',
  SEGERA = 'segera',
  SANGAT_SEGERA = 'sangat_segera',
}

export enum OutgoingLetterType {
  SURAT_KELUAR = 'Surat Keluar',
  SURAT_KEPUTUSAN = 'Surat Keputusan',
  SURAT_TUGAS = 'Surat Tugas',
  SURAT_UNDANGAN = 'Surat Undangan',
  SURAT_KETERANGAN = 'Surat Keterangan',
  SURAT_LAINNYA = 'Surat Lainnya',
}

@Entity('outgoing_letters')
export class OutgoingLetter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nomorSurat: string;

  @Column({ type: 'date' })
  tanggalSurat: Date;

  @Column()
  jenisSurat: string;

  @Column()
  tujuan: string;

  @Column()
  perihal: string;

  @Column({ type: 'text' })
  isiSurat: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({
    type: 'enum',
    enum: OutgoingLetterStatus,
    default: OutgoingLetterStatus.DRAFT,
  })
  status: OutgoingLetterStatus;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({
    type: 'enum',
    enum: LetterPriority,
    nullable: true,
  })
  prioritas: LetterPriority;

  @Column({
    type: 'enum',
    enum: LetterNature,
    nullable: true,
  })
  sifatSurat: LetterNature;

  @Column({ type: 'text', nullable: true })
  isiRingkas: string;

  @Column({ type: 'text', nullable: true })
  tindakLanjut: string;

  @Column({ type: 'date', nullable: true })
  tanggalKirim: Date;

  @Column({ nullable: true })
  pengirim: string;

  @Column({ type: 'json', nullable: true })
  lampiran: string[];

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LetterActivityLog, (log) => log.outgoingLetter)
  activityLogs: LetterActivityLog[];

  @ManyToOne(() => LetterTemplate, (template) => template.outgoingLetters, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: LetterTemplate;
}
