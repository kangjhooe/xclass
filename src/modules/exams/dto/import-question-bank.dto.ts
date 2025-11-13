export class ImportQuestionBankDto {
  targetBankId?: number; // Jika null, akan membuat bank baru
  name?: string; // Nama bank baru jika targetBankId tidak ada
  subjectId?: number;
  classId?: number;
  overwriteExisting?: boolean = false; // Jika true, akan replace soal yang sudah ada
}

