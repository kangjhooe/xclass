import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Payroll } from './entities/payroll.entity';
import { Department } from './entities/department.entity';
import { Position } from './entities/position.entity';
import { PerformanceReview } from './entities/performance-review.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreatePayrollDto, PayrollItemDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { PayrollItem } from './entities/payroll-item.entity';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(Employee)
  private employeeRepository: Repository<Employee>,
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(PerformanceReview)
    private performanceReviewRepository: Repository<PerformanceReview>,
    @InjectRepository(PayrollItem)
    private payrollItemRepository: Repository<PayrollItem>,
  ) {}

  // Employee CRUD
  async createEmployee(createEmployeeDto: CreateEmployeeDto, instansiId: number, userId: number): Promise<Employee> {
    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      instansiId,
      createdBy: userId,
    });
    return await this.employeeRepository.save(employee);
  }

  async findAllEmployees(instansiId: number, filters?: any): Promise<Employee[]> {
    const query = this.employeeRepository
      .createQueryBuilder('employee')
      .where('employee.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('employee.position', 'position')
      .leftJoinAndSelect('employee.department', 'department');

    if (filters?.search) {
      query.andWhere(
        '(employee.name LIKE :search OR employee.employeeNumber LIKE :search OR employee.email LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.status) {
      query.andWhere('employee.status = :status', { status: filters.status });
    }

    if (filters?.departmentId) {
      query.andWhere('employee.departmentId = :departmentId', { departmentId: filters.departmentId });
    }

    if (filters?.positionId) {
      query.andWhere('employee.positionId = :positionId', { positionId: filters.positionId });
    }

    return await query.getMany();
  }

  async findOneEmployee(id: number, instansiId: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id, instansiId },
      relations: ['position', 'department', 'payrolls'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async updateEmployee(id: number, updateEmployeeDto: UpdateEmployeeDto, instansiId: number, userId: number): Promise<Employee> {
    const employee = await this.findOneEmployee(id, instansiId);
    Object.assign(employee, updateEmployeeDto);
    employee.updatedBy = userId;
    return await this.employeeRepository.save(employee);
  }

  async removeEmployee(id: number, instansiId: number): Promise<void> {
    const employee = await this.findOneEmployee(id, instansiId);
    await this.employeeRepository.softDelete(id);
  }

  // Payroll CRUD
  async createPayroll(createPayrollDto: CreatePayrollDto, instansiId: number, userId: number): Promise<Payroll> {
    const { allowances = [], deductions = [], ...payrollData } = createPayrollDto;

    const totalAllowances = allowances.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
    const netSalary = createPayrollDto.basicSalary + totalAllowances - totalDeductions;

    const payroll = this.payrollRepository.create({
      ...payrollData,
      instansiId,
      totalAllowances,
      totalDeductions,
      netSalary,
      createdBy: userId,
    });

    const savedPayroll = await this.payrollRepository.save(payroll);

    // Create payroll items
    const items: PayrollItem[] = [];
    for (const item of allowances) {
      items.push(
        this.payrollItemRepository.create({
          payrollId: savedPayroll.id,
          name: item.name,
          amount: item.amount,
          type: 'allowance',
        }),
      );
    }
    for (const item of deductions) {
      items.push(
        this.payrollItemRepository.create({
          payrollId: savedPayroll.id,
          name: item.name,
          amount: item.amount,
          type: 'deduction',
        }),
      );
    }
    if (items.length > 0) {
      await this.payrollItemRepository.save(items);
    }

    return await this.payrollRepository.findOne({
      where: { id: (savedPayroll as any).id },
      relations: ['employee', 'items'],
    });
  }

  async findAllPayrolls(instansiId: number, filters?: any): Promise<Payroll[]> {
    const query = this.payrollRepository
      .createQueryBuilder('payroll')
      .where('payroll.instansiId = :instansiId', { instansiId })
      .leftJoinAndSelect('payroll.employee', 'employee')
      .leftJoinAndSelect('payroll.items', 'items');

    if (filters?.employeeId) {
      query.andWhere('payroll.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters?.status) {
      query.andWhere('payroll.status = :status', { status: filters.status });
    }

    if (filters?.payrollDate) {
      query.andWhere('payroll.payrollDate = :payrollDate', { payrollDate: filters.payrollDate });
    }

    return await query.getMany();
  }

  async findOnePayroll(id: number, instansiId: number): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id, instansiId },
      relations: ['employee', 'items'],
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return payroll;
  }

  async updatePayroll(id: number, updatePayrollDto: UpdatePayrollDto, instansiId: number, userId: number): Promise<Payroll> {
    const payroll = await this.findOnePayroll(id, instansiId);
    Object.assign(payroll, updatePayrollDto);
    payroll.updatedBy = userId;
    return await this.payrollRepository.save(payroll);
  }

  async removePayroll(id: number, instansiId: number): Promise<void> {
    await this.findOnePayroll(id, instansiId);
    await this.payrollRepository.delete(id);
  }

  // Department CRUD
  async createDepartment(createDepartmentDto: CreateDepartmentDto, instansiId: number): Promise<Department> {
    const department = this.departmentRepository.create({
      ...createDepartmentDto,
      instansiId,
    });
    return await this.departmentRepository.save(department);
  }

  async findAllDepartments(instansiId: number): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: { instansiId },
      relations: ['employees'],
    });
  }

  async findOneDepartment(id: number, instansiId: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id, instansiId },
      relations: ['employees'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async updateDepartment(id: number, updateDepartmentDto: UpdateDepartmentDto, instansiId: number): Promise<Department> {
    const department = await this.findOneDepartment(id, instansiId);
    Object.assign(department, updateDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  async removeDepartment(id: number, instansiId: number): Promise<void> {
    await this.findOneDepartment(id, instansiId);
    await this.departmentRepository.delete(id);
  }

  // Position CRUD
  async createPosition(createPositionDto: CreatePositionDto, instansiId: number): Promise<Position> {
    const position = this.positionRepository.create({
      ...createPositionDto,
      instansiId,
    });
    return await this.positionRepository.save(position);
  }

  async findAllPositions(instansiId: number): Promise<Position[]> {
    return await this.positionRepository.find({
      where: { instansiId },
      relations: ['employees'],
    });
  }

  async findOnePosition(id: number, instansiId: number): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id, instansiId },
      relations: ['employees'],
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  async updatePosition(id: number, updatePositionDto: UpdatePositionDto, instansiId: number): Promise<Position> {
    const position = await this.findOnePosition(id, instansiId);
    Object.assign(position, updatePositionDto);
    return await this.positionRepository.save(position);
  }

  async removePosition(id: number, instansiId: number): Promise<void> {
    await this.findOnePosition(id, instansiId);
    await this.positionRepository.delete(id);
  }

  // Performance Review CRUD
  async createPerformanceReview(
    createReviewDto: CreatePerformanceReviewDto,
    instansiId: number,
    userId: number,
  ): Promise<PerformanceReview> {
    const review = this.performanceReviewRepository.create({
      ...createReviewDto,
    });
    return await this.performanceReviewRepository.save(review);
  }

  async findAllPerformanceReviews(instansiId: number, filters?: any): Promise<PerformanceReview[]> {
    const query = this.performanceReviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.employee', 'employee')
      .where('employee.instansiId = :instansiId', { instansiId });

    if (filters?.employeeId) {
      query.andWhere('review.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    return await query.getMany();
  }

  async findOnePerformanceReview(id: number, instansiId: number): Promise<PerformanceReview> {
    const review = await this.performanceReviewRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!review) {
      throw new NotFoundException(`Performance review with ID ${id} not found`);
    }

    // Verify employee belongs to tenant
    if (review.employee.instansiId !== instansiId) {
      throw new NotFoundException(`Performance review with ID ${id} not found`);
    }

    return review;
  }

  async updatePerformanceReview(
    id: number,
    updateReviewDto: any,
    instansiId: number,
    userId: number,
  ): Promise<PerformanceReview> {
    const review = await this.findOnePerformanceReview(id, instansiId);
    Object.assign(review, updateReviewDto);
    return await this.performanceReviewRepository.save(review);
  }

  async removePerformanceReview(id: number, instansiId: number): Promise<void> {
    await this.findOnePerformanceReview(id, instansiId);
    await this.performanceReviewRepository.delete(id);
  }
}
