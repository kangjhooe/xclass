import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddAcademicTrackingToStudents1736755200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambahkan kolom academic_level
    await queryRunner.addColumn(
      'students',
      new TableColumn({
        name: 'academic_level',
        type: 'varchar',
        length: '20',
        isNullable: true,
        comment: 'Level pendidikan: SD, SMP, SMA, SMK',
      }),
    );

    // Tambahkan kolom current_grade
    await queryRunner.addColumn(
      'students',
      new TableColumn({
        name: 'current_grade',
        type: 'varchar',
        length: '10',
        isNullable: true,
        comment: 'Kelas saat ini: 1-6 (SD), 7-9 (SMP), 10-12 (SMA)',
      }),
    );

    // Tambahkan kolom academic_year
    await queryRunner.addColumn(
      'students',
      new TableColumn({
        name: 'academic_year',
        type: 'varchar',
        length: '10',
        isNullable: true,
        comment: 'Tahun ajaran saat ini, format: 2024/2025',
      }),
    );

    // Buat index untuk NISN
    await queryRunner.createIndex(
      'students',
      new TableIndex({
        name: 'idx_students_nisn',
        columnNames: ['nisn'],
      }),
    );

    // Buat index untuk academic_level
    await queryRunner.createIndex(
      'students',
      new TableIndex({
        name: 'idx_students_academic_level',
        columnNames: ['academic_level'],
      }),
    );

    // Buat index untuk academic_year
    await queryRunner.createIndex(
      'students',
      new TableIndex({
        name: 'idx_students_academic_year',
        columnNames: ['academic_year'],
      }),
    );

    // Buat composite index
    await queryRunner.createIndex(
      'students',
      new TableIndex({
        name: 'idx_students_level_grade_year',
        columnNames: ['academic_level', 'current_grade', 'academic_year'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus index
    await queryRunner.dropIndex('students', 'idx_students_level_grade_year');
    await queryRunner.dropIndex('students', 'idx_students_academic_year');
    await queryRunner.dropIndex('students', 'idx_students_academic_level');
    await queryRunner.dropIndex('students', 'idx_students_nisn');

    // Hapus kolom
    await queryRunner.dropColumn('students', 'academic_year');
    await queryRunner.dropColumn('students', 'current_grade');
    await queryRunner.dropColumn('students', 'academic_level');
  }
}

