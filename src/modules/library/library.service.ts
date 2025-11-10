import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Book, BookStatus } from './entities/book.entity';
import { BookLoan, LoanStatus } from './entities/book-loan.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookLoanDto } from './dto/create-book-loan.dto';
import { UpdateBookLoanDto } from './dto/update-book-loan.dto';
import { ReturnBookLoanDto } from './dto/return-book-loan.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(BookLoan)
    private bookLoansRepository: Repository<BookLoan>,
  ) {}

  // ========== Book CRUD ==========
  async create(createBookDto: CreateBookDto, instansiId: number) {
    const book = this.booksRepository.create({
      ...createBookDto,
      instansiId,
      status: createBookDto.status || BookStatus.AVAILABLE,
      totalCopies: createBookDto.totalCopies || 1,
      availableCopies: createBookDto.totalCopies || 1,
      language: createBookDto.language || 'id',
      isOnline: createBookDto.isOnline || false,
      isPublic: createBookDto.isPublic || false,
      allowDownload: createBookDto.allowDownload || false,
    });

    if (createBookDto.purchaseDate) {
      book.purchaseDate = new Date(createBookDto.purchaseDate);
    }

    return await this.booksRepository.save(book);
  }

  async findAll(filters: {
    search?: string;
    category?: string;
    status?: BookStatus;
    author?: string;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      search,
      category,
      status,
      author,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.booksRepository
      .createQueryBuilder('book')
      .where('book.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('book.loans', 'loans');

    if (search) {
      queryBuilder.andWhere(
        '(book.title LIKE :search OR book.author LIKE :search OR book.isbn LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('book.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('book.status = :status', { status });
    }

    if (author) {
      queryBuilder.andWhere('book.author LIKE :author', {
        author: `%${author}%`,
      });
    }

    queryBuilder.orderBy('book.title', 'ASC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, instansiId: number) {
    const book = await this.booksRepository.findOne({
      where: { id, instansiId },
      relations: ['loans', 'loans.student', 'loans.teacher'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto, instansiId: number) {
    const book = await this.findOne(id, instansiId);

    if (updateBookDto.purchaseDate) {
      book.purchaseDate = new Date(updateBookDto.purchaseDate);
    }

    Object.assign(book, updateBookDto);
    return await this.booksRepository.save(book);
  }

  async remove(id: number, instansiId: number) {
    const book = await this.findOne(id, instansiId);
    await this.booksRepository.remove(book);
    return { message: 'Book deleted successfully' };
  }

  // ========== Book Loan Management ==========
  async createLoan(
    createLoanDto: CreateBookLoanDto,
    instansiId: number,
    createdBy?: number,
  ) {
    const book = await this.findOne(createLoanDto.bookId, instansiId);

    if (book.status !== BookStatus.AVAILABLE || book.availableCopies <= 0) {
      throw new BadRequestException('Book is not available for loan');
    }

    // Check borrower
    if (
      !createLoanDto.studentId &&
      !createLoanDto.teacherId &&
      !createLoanDto.staffId
    ) {
      throw new BadRequestException('Borrower is required');
    }

    const loan = this.bookLoansRepository.create({
      ...createLoanDto,
      bookId: book.id,
      instansiId,
      loanDate: createLoanDto.loanDate
        ? new Date(createLoanDto.loanDate)
        : new Date(),
      dueDate: new Date(createLoanDto.dueDate),
      status: LoanStatus.ACTIVE,
      createdBy,
    });

    const savedLoan = await this.bookLoansRepository.save(loan);

    // Update book available copies
    book.availableCopies = book.availableCopies - 1;
    if (book.availableCopies === 0) {
      book.status = BookStatus.UNAVAILABLE;
    }
    await this.booksRepository.save(book);

    return savedLoan;
  }

  async findAllLoans(filters: {
    bookId?: number;
    studentId?: number;
    teacherId?: number;
    status?: LoanStatus;
    page?: number;
    limit?: number;
    instansiId: number;
  }) {
    const {
      bookId,
      studentId,
      teacherId,
      status,
      page = 1,
      limit = 20,
      instansiId,
    } = filters;

    const queryBuilder = this.bookLoansRepository
      .createQueryBuilder('loan')
      .where('loan.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.student', 'student')
      .leftJoinAndSelect('loan.teacher', 'teacher');

    if (bookId) {
      queryBuilder.andWhere('loan.bookId = :bookId', { bookId });
    }

    if (studentId) {
      queryBuilder.andWhere('loan.studentId = :studentId', { studentId });
    }

    if (teacherId) {
      queryBuilder.andWhere('loan.teacherId = :teacherId', { teacherId });
    }

    if (status) {
      queryBuilder.andWhere('loan.status = :status', { status });
    }

    queryBuilder.orderBy('loan.loanDate', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneLoan(loanId: number, instansiId: number) {
    const loan = await this.bookLoansRepository.findOne({
      where: { id: loanId, instansiId },
      relations: ['book', 'student', 'teacher'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${loanId} not found`);
    }

    return loan;
  }

  async returnLoan(
    loanId: number,
    returnDto: ReturnBookLoanDto,
    instansiId: number,
    returnedBy?: number,
  ) {
    const loan = await this.findOneLoan(loanId, instansiId);

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException('Loan is not active');
    }

    loan.status = LoanStatus.RETURNED;
    loan.returnDate = new Date();
    loan.returnNotes = returnDto.returnNotes;
    loan.returnedBy = returnedBy;

    if (returnDto.fineAmount) {
      loan.fineAmount = returnDto.fineAmount;
    }

    await this.bookLoansRepository.save(loan);

    // Update book available copies
    const book = await this.findOne(loan.bookId, instansiId);
    book.availableCopies = book.availableCopies + 1;
    if (book.status === BookStatus.UNAVAILABLE && book.availableCopies > 0) {
      book.status = BookStatus.AVAILABLE;
    }
    await this.booksRepository.save(book);

    return loan;
  }

  async getOverdueLoans(instansiId: number) {
    const today = new Date();
    return await this.bookLoansRepository.find({
      where: {
        instansiId,
        status: LoanStatus.ACTIVE,
        dueDate: LessThan(today),
      },
      relations: ['book', 'student', 'teacher'],
    });
  }

  async getStatistics(instansiId: number) {
    const totalBooks = await this.booksRepository.count({
      where: { instansiId },
    });

    const availableBooks = await this.booksRepository.count({
      where: { instansiId, status: BookStatus.AVAILABLE },
    });

    const activeLoans = await this.bookLoansRepository.count({
      where: { instansiId, status: LoanStatus.ACTIVE },
    });

    const overdueLoans = await this.getOverdueLoans(instansiId);

    return {
      totalBooks,
      availableBooks,
      borrowedBooks: totalBooks - availableBooks,
      activeLoans,
      overdueLoans: overdueLoans.length,
    };
  }
}

