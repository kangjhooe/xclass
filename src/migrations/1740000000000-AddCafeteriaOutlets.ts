import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddCafeteriaOutlets1740000000000 implements MigrationInterface {
  private menuForeignKey = new TableForeignKey({
    columnNames: ['canteen_id'],
    referencedTableName: 'cafeteria_outlets',
    referencedColumnNames: ['id'],
    onDelete: 'CASCADE',
  });

  private orderForeignKey = new TableForeignKey({
    columnNames: ['canteen_id'],
    referencedTableName: 'cafeteria_outlets',
    referencedColumnNames: ['id'],
    onDelete: 'CASCADE',
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cafeteria_outlets',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'instansiId',
            type: 'int',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '150',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'contactPerson',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'contactPhone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'openingHours',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await this.addColumnIfMissing(
      queryRunner,
      'cafeteria_menus',
      new TableColumn({
        name: 'canteen_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await this.addColumnIfMissing(
      queryRunner,
      'cafeteria_orders',
      new TableColumn({
        name: 'canteen_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await this.createForeignKeySafely(
      queryRunner,
      'cafeteria_menus',
      this.menuForeignKey,
    );
    await this.createForeignKeySafely(
      queryRunner,
      'cafeteria_orders',
      this.orderForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('cafeteria_orders', this.orderForeignKey);
    await queryRunner.dropForeignKey('cafeteria_menus', this.menuForeignKey);

    await queryRunner.dropColumn('cafeteria_orders', 'canteen_id');
    await queryRunner.dropColumn('cafeteria_menus', 'canteen_id');

    await queryRunner.dropTable('cafeteria_outlets');
  }

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
    column: TableColumn,
  ): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(tableName, column.name);
    if (!hasColumn) {
      await queryRunner.addColumn(tableName, column);
    }
  }

  private async createForeignKeySafely(
    queryRunner: QueryRunner,
    tableName: string,
    foreignKey: TableForeignKey,
  ): Promise<void> {
    try {
      await queryRunner.createForeignKey(tableName, foreignKey);
    } catch (error: any) {
      const message = error?.message ?? '';
      if (
        error?.code === 'ER_CANT_CREATE_TABLE' ||
        error?.code === 'ER_DUP_KEYNAME' ||
        message.includes('Duplicate key') ||
        message.includes('errno: 121')
      ) {
        return;
      }
      throw error;
    }
  }
}


