import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class AddQuestionToExamDto {
  @IsNumber()
  questionId: number; // ID dari Question (bank soal)

  @IsNumber()
  @IsOptional()
  points?: number; // Override points jika perlu

  @IsNumber()
  @IsOptional()
  order?: number; // Urutan di ujian
}

