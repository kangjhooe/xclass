import { PartialType } from '@nestjs/mapped-types';
import { CreateBookLoanDto } from './create-book-loan.dto';

export class UpdateBookLoanDto extends PartialType(CreateBookLoanDto) {}

