import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { LetterActivityLog } from './letter-activity-log.entity';

export enum LetterStatus {
  BARU = 'baru',
  DIPROSES = 'diproses',
  SELESAI = 'selesai',
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

export enum LetterType {
  SURAT_MASUK = 'Surat Masuk',
  SURAT_KEPUTUSAN = 'Surat Keputusan',
  SURAT_TUGAS = 'Surat Tugas',
  SURAT_UNDANGAN = 'Surat Undangan',
  SURAT_KETERANGAN = 'Surat Keterangan',
  SURAT_LAINNYA = 'Surat Lainnya',
}

@Entity('incoming_letters')
export class IncomingLetter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nomorSurat: string;

  @Column({ type: 'date' })
  tanggalTerima: Date;

  @Column()
  pengirim: string;

  @Column()
  perihal: string;

  @Column({ type: 'json', nullable: true })
  lampiran: string[];

  @Column({ nullable: true })
  filePath: string;

  @Column({
    type: 'enum',
    enum: LetterStatus,
    default: LetterStatus.BARU,
  })
  status: LetterStatus;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ type: 'json', nullable: true })
  disposisi: Record<string, any>;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ nullable: true })
  jenisSurat: string;

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
  tanggalDisposisi: Date;

  @Column({ nullable: true })
  penerimaDisposisi: string;

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LetterActivityLog, (log) => log.incomingLetter)
  activityLogs: LetterActivityLog[];
}
