import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestBookController } from './guest-book.controller';
import { GuestBookService } from './guest-book.service';
import { GuestBook } from './entities/guest-book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuestBook])],
  controllers: [GuestBookController],
  providers: [GuestBookService],
  exports: [GuestBookService],
})
export class GuestBookModule {}

