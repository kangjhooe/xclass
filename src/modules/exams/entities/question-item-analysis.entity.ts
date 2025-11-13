import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { ExamQuestion } from './exam-question.entity';

@Entity('question_item_analyses')
export class QuestionItemAnalysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examId: number;

  @Column()
  questionId: number; // ExamQuestion ID

  @Column({ type: 'int', default: 0 })
  totalAttempts: number; // Total siswa yang menjawab soal ini

  @Column({ type: 'int', default: 0 })
  correctAnswers: number; // Jumlah yang benar

  @Column({ type: 'int', default: 0 })
  incorrectAnswers: number; // Jumlah yang salah

  @Column({ type: 'int', default: 0 })
  blankAnswers: number; // Jumlah yang tidak dijawab

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  difficultyIndex: number; // Indeks kesulitan (0-1, semakin tinggi semakin mudah)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discriminationIndex: number; // Daya pembeda (-1 sampai 1, semakin tinggi semakin baik)

  @Column({ type: 'json', nullable: true })
  optionStatistics: Record<string, {
    selected: number; // Berapa kali dipilih
    percentage: number; // Persentase
    isCorrect: boolean;
  }>; // Statistik per pilihan jawaban

  @Column({ type: 'json', nullable: true })
  topGroupStats: {
    correct: number;
    total: number;
    percentage: number;
  }; // Statistik kelompok atas (27% terbaik)

  @Column({ type: 'json', nullable: true })
  bottomGroupStats: {
    correct: number;
    total: number;
    percentage: number;
  }; // Statistik kelompok bawah (27% terburuk)

  @Column({ type: 'text', nullable: true })
  analysis: string; // Analisis dan rekomendasi

  @Column()
  instansiId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => ExamQuestion)
  @JoinColumn({ name: 'question_id' })
  question: ExamQuestion;
}

