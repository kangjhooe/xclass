import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateStudentGradesForAssessments1739804800000
  implements MigrationInterface
{
  private readonly tableName = 'student_grades';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'assessment_type',
        type: 'enum',
        enum: ['NH', 'PTS', 'PAS', 'PROJECT', 'OTHER'],
        default: `'NH'`,
      }),
    );

    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'custom_assessment_label',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'weight',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'competency_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'learning_outcome',
        type: 'text',
        isNullable: true,
      }),
    );

    // Migrasi data assignment_type yang lama ke assessment_type baru
    await queryRunner.query(`
      UPDATE ${this.tableName}
      SET
        assessment_type = CASE
          WHEN LOWER(COALESCE(assignment_type, '')) IN ('nh', 'uh', 'ulangan harian', 'harian', 'daily', 'daily test') THEN 'NH'
          WHEN LOWER(COALESCE(assignment_type, '')) IN ('pts', 'uts', 'midterm', 'tengah semester', 'penilaian tengah semester') THEN 'PTS'
          WHEN LOWER(COALESCE(assignment_type, '')) IN ('pas', 'uas', 'final', 'akhir semester', 'penilaian akhir semester') THEN 'PAS'
          WHEN LOWER(COALESCE(assignment_type, '')) IN ('project', 'projek', 'praktek', 'praktik', 'project based') THEN 'PROJECT'
          WHEN assignment_type IS NULL OR assignment_type = '' THEN assessment_type
          ELSE 'OTHER'
        END,
        custom_assessment_label = CASE
          WHEN LOWER(COALESCE(assignment_type, '')) IN (
            'nh', 'uh', 'ulangan harian', 'harian', 'daily', 'daily test',
            'pts', 'uts', 'midterm', 'tengah semester', 'penilaian tengah semester',
            'pas', 'uas', 'final', 'akhir semester', 'penilaian akhir semester',
            'project', 'projek', 'praktek', 'praktik', 'project based'
          )
          OR assignment_type IS NULL OR assignment_type = ''
          THEN NULL
          ELSE assignment_type
        END
    `);

    // Hapus kolom lama assignment_type
    const hasAssignmentType = await queryRunner.hasColumn(this.tableName, 'assignment_type');
    if (hasAssignmentType) {
      await queryRunner.dropColumn(this.tableName, 'assignment_type');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'assignment_type',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.query(`
      UPDATE ${this.tableName}
      SET assignment_type = CASE
        WHEN assessment_type = 'NH' THEN 'NH'
        WHEN assessment_type = 'PTS' THEN 'PTS'
        WHEN assessment_type = 'PAS' THEN 'PAS'
        WHEN assessment_type = 'PROJECT' THEN 'PROJECT'
        WHEN assessment_type = 'OTHER' THEN custom_assessment_label
        ELSE assignment_type
      END
    `);

    await queryRunner.dropColumn(this.tableName, 'learning_outcome');
    await queryRunner.dropColumn(this.tableName, 'competency_id');
    await queryRunner.dropColumn(this.tableName, 'weight');
    await queryRunner.dropColumn(this.tableName, 'custom_assessment_label');
    await queryRunner.dropColumn(this.tableName, 'assessment_type');
  }
}


