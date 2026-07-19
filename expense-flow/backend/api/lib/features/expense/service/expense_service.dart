import 'package:uuid/uuid.dart';
import '../../../app/exceptions/app_exception.dart';
import '../../../shared/models/models.dart';
import '../../../shared/repositories/repositories.dart';
import '../dto/expense_dto.dart';

class ExpenseService {
  final ExpenseRepository _expenseRepository;
  final CategoryRepository _categoryRepository;
  final _uuid = const Uuid();

  ExpenseService({
    required ExpenseRepository expenseRepository,
    required CategoryRepository categoryRepository,
  })  : _expenseRepository = expenseRepository,
        _categoryRepository = categoryRepository;

  Future<DbExpenseView> createExpense(String userId, CreateExpenseDto dto) async {
    if (dto.categoryId != null) {
      final category = await _categoryRepository.getById(dto.categoryId!);
      if (category == null || category.userId != userId) {
        throw ValidationException('Category not found or access denied.');
      }
    }

    final id = _uuid.v4();
    final expense = Expense(
      id: id,
      userId: userId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      currency: dto.currency,
      note: dto.note,
      expenseDate: dto.expenseDate,
      receiptUrl: dto.receiptUrl,
      createdAt: DateTime.now(),
      updatedAt: null,
      deletedAt: null,
    );

    await _expenseRepository.create(expense);

    final created = await _expenseRepository.getById(id);
    if (created == null) {
      throw InternalServerException('Failed to retrieve created expense.');
    }
    return created;
  }

  Future<List<DbExpenseView>> getExpenses(
    String userId, {
    int? page,
    int? pageSize,
    DateTime? modifiedSince,
    bool includeDeleted = false,
  }) async {
    int? limit;
    int? offset;

    if (page != null && pageSize != null) {
      if (page < 1 || pageSize < 1) {
        throw ValidationException('Page and pageSize must be positive integers.');
      }
      limit = pageSize;
      offset = (page - 1) * pageSize;
    }

    return _expenseRepository.getByUserId(
      userId,
      limit: limit,
      offset: offset,
      includeDeleted: includeDeleted,
      modifiedSince: modifiedSince,
    );
  }

  Future<DbExpenseView> getExpenseById(String userId, String id) async {
    final expense = await _expenseRepository.getById(id);
    if (expense == null || expense.userId != userId || expense.deletedAt != null) {
      throw NotFoundException('Expense not found.');
    }
    return expense;
  }

  Future<DbExpenseView> updateExpense(
    String userId,
    String id,
    UpdateExpenseDto dto,
  ) async {
    final existing = await _expenseRepository.getById(id);
    if (existing == null || existing.userId != userId || existing.deletedAt != null) {
      throw NotFoundException('Expense not found.');
    }

    if (dto.categoryId != null) {
      final category = await _categoryRepository.getById(dto.categoryId!);
      if (category == null || category.userId != userId) {
        throw ValidationException('Category not found or access denied.');
      }
    }

    final expense = Expense(
      id: id,
      userId: userId,
      categoryId: dto.categoryId ?? existing.categoryId,
      amount: dto.amount ?? existing.amount,
      currency: dto.currency ?? existing.currency,
      note: dto.note ?? existing.note,
      expenseDate: dto.expenseDate ?? existing.expenseDate,
      receiptUrl: dto.receiptUrl ?? existing.receiptUrl,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now(),
      deletedAt: null,
    );

    await _expenseRepository.update(expense);

    final updated = await _expenseRepository.getById(id);
    if (updated == null) {
      throw InternalServerException('Failed to retrieve updated expense.');
    }
    return updated;
  }

  Future<void> deleteExpense(String userId, String id) async {
    final existing = await _expenseRepository.getById(id);
    if (existing == null || existing.userId != userId || existing.deletedAt != null) {
      throw NotFoundException('Expense not found.');
    }

    final expense = Expense(
      id: id,
      userId: userId,
      categoryId: existing.categoryId,
      amount: existing.amount,
      currency: existing.currency,
      note: existing.note,
      expenseDate: existing.expenseDate,
      receiptUrl: existing.receiptUrl,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      deletedAt: DateTime.now(),
    );

    await _expenseRepository.update(expense);
  }
}
