import 'dart:convert';
import 'package:drift/drift.dart';
import 'package:shared_models/shared_models.dart';
import 'package:uuid/uuid.dart';
import 'package:mobile/core/database/local_database.dart';
import 'package:mobile/core/utils/result.dart';
import 'package:mobile/features/expenses/domain/entity/sync_status.dart';
import '../../domain/repository/expense_repository.dart';
import '../datasource/local/expense_local_datasource.dart';
import '../datasource/remote/expense_remote_datasource.dart';

class ExpenseRepositoryImpl implements ExpenseRepository {
  final ExpenseLocalDataSource _localDataSource;
  final _uuid = const Uuid();

  // ignore: prefer_initializing_formals
  ExpenseRepositoryImpl({
    required ExpenseRemoteDataSource remoteDataSource,
    required ExpenseLocalDataSource localDataSource,
  })  : _localDataSource = localDataSource;

  Expense _mapLocalToDomain(LocalExpense local) {
    return Expense(
      id: local.id,
      userId: local.userId,
      categoryId: local.categoryId,
      amount: local.amount,
      currency: local.currency,
      note: local.note,
      expenseDate: local.expenseDate,
      receiptUrl: local.receiptUrl,
      syncStatus: local.syncStatus,
      createdAt: local.createdAt,
      updatedAt: local.updatedAt,
      deletedAt: local.deletedAt,
    );
  }

  LocalExpense _mapDomainToLocal(Expense domain) {
    return LocalExpense(
      id: domain.id,
      userId: domain.userId,
      categoryId: domain.categoryId,
      amount: domain.amount,
      currency: domain.currency,
      note: domain.note,
      expenseDate: domain.expenseDate,
      receiptUrl: domain.receiptUrl,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
      syncStatus: domain.syncStatus ?? SyncStatus.synced.name,
    );
  }

  @override
  Stream<List<Expense>> watchExpenses() {
    return _localDataSource.watchAllExpenses().map(
          (list) => list.map<Expense>(_mapLocalToDomain).toList(),
        );
  }

  @override
  Future<Result<List<Expense>>> getExpenses({int? page, int? pageSize}) async {
    final localList = await _localDataSource.getAllExpenses();
    return Success(localList.map<Expense>(_mapLocalToDomain).toList());
  }

  @override
  Future<Result<Expense>> getExpenseById(String id) async {
    try {
      final local = await _localDataSource.getExpenseById(id);
      if (local != null) {
        return Success(_mapLocalToDomain(local));
      }
      return const Failure('Expense not found locally.');
    } catch (e) {
      return Failure('Error fetching expense: $e');
    }
  }

  @override
  Future<Result<Expense>> createExpense({
    String? categoryId,
    required double amount,
    required String currency,
    required String note,
    required DateTime expenseDate,
    String? receiptUrl,
  }) async {
    final id = _uuid.v4();
    final localExpense = Expense(
      id: id,
      userId: '00000000-0000-0000-0000-000000000000',
      categoryId: categoryId,
      amount: amount,
      currency: currency,
      note: note,
      expenseDate: expenseDate,
      receiptUrl: receiptUrl,
      createdAt: DateTime.now(),
    );

    await _localDataSource.saveExpense(
      _mapDomainToLocal(localExpense).copyWith(
        syncStatus: SyncStatus.pending.name,
      ),
    );

    await _localDataSource.addToSyncQueue(
      entity: 'expenses',
      entityId: id,
      operation: 'CREATE',
      payload: jsonEncode(localExpense.toJson()),
    );

    return Success(localExpense);
  }

  @override
  Future<Result<Expense>> updateExpense(
    String id, {
    String? categoryId,
    double? amount,
    String? currency,
    String? note,
    DateTime? expenseDate,
    String? receiptUrl,
  }) async {
    final local = await _localDataSource.getExpenseById(id);
    if (local == null) {
      return const Failure('Expense not found.');
    }

    final updatedLocal = _mapLocalToDomain(local).copyWith(
      categoryId: categoryId ?? local.categoryId,
      amount: amount ?? local.amount,
      currency: currency ?? local.currency,
      note: note ?? local.note,
      expenseDate: expenseDate ?? local.expenseDate,
      receiptUrl: receiptUrl ?? local.receiptUrl,
      updatedAt: DateTime.now(),
    );

    await _localDataSource.saveExpense(
      _mapDomainToLocal(updatedLocal).copyWith(
        syncStatus: SyncStatus.pending.name,
      ),
    );

    await _localDataSource.addToSyncQueue(
      entity: 'expenses',
      entityId: id,
      operation: 'UPDATE',
      payload: jsonEncode(updatedLocal.toJson()),
    );

    return Success(updatedLocal);
  }

  @override
  Future<Result<void>> deleteExpense(String id) async {
    final local = await _localDataSource.getExpenseById(id);
    if (local == null) {
      return const Failure('Expense not found.');
    }

    await _localDataSource.saveExpense(
      local.copyWith(
        deletedAt: Value(DateTime.now()),
        syncStatus: SyncStatus.pending.name,
      ),
    );

    await _localDataSource.addToSyncQueue(
      entity: 'expenses',
      entityId: id,
      operation: 'DELETE',
      payload: '{}',
    );

    return const Success(null);
  }
}
