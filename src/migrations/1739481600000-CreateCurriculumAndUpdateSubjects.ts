import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCurriculumAndUpdateSubjects1739481600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'curricula',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'instansi_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['K13', 'Merdeka', 'Mandiri', 'Kurikulum 2013'],
            default: `'K13'`,
          },
          {
            name: 'academic_year_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'level',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'grade',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'semester',
            type: 'int',
            default: 1,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'curricula',
      new TableIndex({
        name: 'idx_curricula_instansi',
        columnNames: ['instansi_id'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'syllabi',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'instansi_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'curriculum_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'subject_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'total_hours',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_meetings',
            type: 'int',
            default: 0,
          },
          {
            name: 'learning_objectives',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'assessment_methods',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'learning_resources',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'syllabi',
      new TableIndex({
        name: 'idx_syllabi_instansi',
        columnNames: ['instansi_id'],
      }),
    );

    await queryRunner.createForeignKeys('syllabi', [
      new TableForeignKey({
        columnNames: ['curriculum_id'],
        referencedTableName: 'curricula',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['subject_id'],
        referencedTableName: 'subjects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'learning_materials',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'instansi_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'syllabus_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['theory', 'practice', 'assignment', 'exam', 'project'],
            default: `'theory'`,
          },
          {
            name: 'meeting_number',
            type: 'int',
            default: 1,
          },
          {
            name: 'estimated_hours',
            type: 'int',
            default: 0,
          },
          {
            name: 'file_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'video_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'link_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'learning_materials',
      new TableIndex({
        name: 'idx_learning_materials_instansi',
        columnNames: ['instansi_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'learning_materials',
      new TableForeignKey({
        columnNames: ['syllabus_id'],
        referencedTableName: 'syllabi',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'competencies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'instansi_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'syllabus_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['KI', 'KD', 'IPK'],
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'order',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'competencies',
      new TableIndex({
        name: 'idx_competencies_instansi',
        columnNames: ['instansi_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'competencies',
      new TableForeignKey({
        columnNames: ['syllabus_id'],
        referencedTableName: 'syllabi',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'curriculum_schedules',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'instansi_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'curriculum_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'syllabus_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'learning_material_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'class_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'subject_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'teacher_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'schedule_date',
            type: 'date',
          },
          {
            name: 'start_time',
            type: 'time',
          },
          {
            name: 'end_time',
            type: 'time',
          },
          {
            name: 'room',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'meeting_number',
            type: 'int',
            default: 1,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'homework',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_completed',
            type: 'tinyint',
            default: 0,
          },
          {
            name: 'completed_at',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'curriculum_schedules',
      new TableIndex({
        name: 'idx_curriculum_schedules_instansi',
        columnNames: ['instansi_id'],
      }),
    );

    await queryRunner.createForeignKeys('curriculum_schedules', [
      new TableForeignKey({
        columnNames: ['curriculum_id'],
        referencedTableName: 'curricula',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['syllabus_id'],
        referencedTableName: 'syllabi',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['learning_material_id'],
        referencedTableName: 'learning_materials',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['class_id'],
        referencedTableName: 'classes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['subject_id'],
        referencedTableName: 'subjects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['teacher_id'],
        referencedTableName: 'teachers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.addColumns('subjects', [
      new TableColumn({
        name: 'grade',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
      new TableColumn({
        name: 'semester',
        type: 'int',
        isNullable: true,
      }),
      new TableColumn({
        name: 'department',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
      new TableColumn({
        name: 'category',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
      new TableColumn({
        name: 'learning_focus',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'curriculum_type',
        type: 'enum',
        enum: ['K13', 'Merdeka', 'Mandiri', 'Kurikulum 2013'],
        isNullable: true,
      }),
      new TableColumn({
        name: 'subject_order',
        type: 'int',
        default: 0,
      }),
      new TableColumn({
        name: 'minimum_passing_score',
        type: 'float',
        default: 75,
      }),
      new TableColumn({
        name: 'is_mandatory',
        type: 'tinyint',
        default: 1,
      }),
      new TableColumn({
        name: 'is_elective',
        type: 'tinyint',
        default: 0,
      }),
      new TableColumn({
        name: 'color',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    ]);

    await queryRunner.createIndex(
      'subjects',
      new TableIndex({
        name: 'idx_subjects_curriculum_type',
        columnNames: ['curriculum_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('subjects', 'idx_subjects_curriculum_type');

    await queryRunner.dropColumn('subjects', 'color');
    await queryRunner.dropColumn('subjects', 'is_elective');
    await queryRunner.dropColumn('subjects', 'is_mandatory');
    await queryRunner.dropColumn('subjects', 'minimum_passing_score');
    await queryRunner.dropColumn('subjects', 'subject_order');
    await queryRunner.dropColumn('subjects', 'curriculum_type');
    await queryRunner.dropColumn('subjects', 'learning_focus');
    await queryRunner.dropColumn('subjects', 'category');
    await queryRunner.dropColumn('subjects', 'department');
    await queryRunner.dropColumn('subjects', 'semester');
    await queryRunner.dropColumn('subjects', 'grade');

    await queryRunner.dropTable('curriculum_schedules');
    await queryRunner.dropTable('competencies');
    await queryRunner.dropTable('learning_materials');
    await queryRunner.dropTable('syllabi');
    await queryRunner.dropTable('curricula');
  }
}
