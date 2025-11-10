import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookLoanDto } from './dto/create-book-loan.dto';
import { ReturnBookLoanDto } from './dto/return-book-loan.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { BookStatus } from './entities/book.entity';
import { LoanStatus } from './entities/book-loan.entity';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  // ========== Books ==========
  @Post('books')
  createBook(@Body() createBookDto: CreateBookDto, @TenantId() instansiId: number) {
    return this.libraryService.create(createBookDto, instansiId);
  }

  @Get('books')
  findAllBooks(
    @TenantId() instansiId: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: BookStatus,
    @Query('author') author?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.libraryService.findAll({
      search,
      category,
      status,
      author,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('books/:id')
  findOneBook(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.libraryService.findOne(+id, instansiId);
  }

  @Patch('books/:id')
  updateBook(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @TenantId() instansiId: number,
  ) {
    return this.libraryService.update(+id, updateBookDto, instansiId);
  }

  @Delete('books/:id')
  removeBook(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.libraryService.remove(+id, instansiId);
  }

  // ========== Loans ==========
  @Post('loans')
  createLoan(
    @Body() createLoanDto: CreateBookLoanDto,
    @TenantId() instansiId: number,
    @Query('createdBy') createdBy?: number,
  ) {
    return this.libraryService.createLoan(
      createLoanDto,
      instansiId,
      createdBy ? +createdBy : undefined,
    );
  }

  @Get('loans')
  findAllLoans(
    @TenantId() instansiId: number,
    @Query('bookId') bookId?: number,
    @Query('studentId') studentId?: number,
    @Query('teacherId') teacherId?: number,
    @Query('status') status?: LoanStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.libraryService.findAllLoans({
      bookId: bookId ? +bookId : undefined,
      studentId: studentId ? +studentId : undefined,
      teacherId: teacherId ? +teacherId : undefined,
      status,
      page: +page,
      limit: +limit,
      instansiId,
    });
  }

  @Get('loans/:id')
  findOneLoan(@Param('id') id: string, @TenantId() instansiId: number) {
    return this.libraryService.findOneLoan(+id, instansiId);
  }

  @Post('loans/:id/return')
  returnLoan(
    @Param('id') id: string,
    @Body() returnDto: ReturnBookLoanDto,
    @TenantId() instansiId: number,
    @Query('returnedBy') returnedBy?: number,
  ) {
    return this.libraryService.returnLoan(
      +id,
      returnDto,
      instansiId,
      returnedBy ? +returnedBy : undefined,
    );
  }

  @Get('loans/overdue')
  getOverdueLoans(@TenantId() instansiId: number) {
    return this.libraryService.getOverdueLoans(instansiId);
  }

  @Get('statistics')
  getStatistics(@TenantId() instansiId: number) {
    return this.libraryService.getStatistics(instansiId);
  }
}

