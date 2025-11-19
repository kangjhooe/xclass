import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGuestBookPhoto1741000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('guest_books', 'photo_url');
    if (hasColumn) {
      return;
    }

    await queryRunner.addColumn(
      'guest_books',
      new TableColumn({
        name: 'photo_url',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('guest_books', 'photo_url');
    if (!hasColumn) {
      return;
    }

    await queryRunner.dropColumn('guest_books', 'photo_url');
  }
}


