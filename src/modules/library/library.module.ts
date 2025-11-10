import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Book } from './entities/book.entity';
import { BookLoan } from './entities/book-loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, BookLoan])],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}

