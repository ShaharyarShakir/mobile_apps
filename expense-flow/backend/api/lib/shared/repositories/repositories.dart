import '../models/models.dart';

abstract class UserRepository {
  Future<DbUserView?> getById(String id);
  Future<DbUserView?> getByEmail(String email);
  Future<void> create(DbUser user);
  Future<void> update(DbUser user);
  Future<void> delete(String id);
}

abstract class CategoryRepository {
  Future<DbCategoryView?> getById(String id);
  Future<List<DbCategoryView>> getByUserId(String userId);
  Future<void> create(DbCategory category);
  Future<void> update(DbCategory category);
  Future<void> delete(String id);
}

abstract class ExpenseRepository {
  Future<DbExpenseView?> getById(String id);
  Future<List<DbExpenseView>> getByUserId(
    String userId, {
    int? limit,
    int? offset,
    bool includeDeleted = false,
    DateTime? modifiedSince,
  });
  Future<void> create(DbExpense expense);
  Future<void> update(DbExpense expense);
  Future<void> delete(String id);
}

abstract class IncomeRepository {
  Future<DbIncomeView?> getById(String id);
  Future<List<DbIncomeView>> getByUserId(String userId);
  Future<void> create(DbIncome income);
  Future<void> update(DbIncome income);
  Future<void> delete(String id);
}

abstract class BudgetRepository {
  Future<DbBudgetView?> getById(String id);
  Future<List<DbBudgetView>> getByUserId(String userId);
  Future<void> create(DbBudget budget);
  Future<void> update(DbBudget budget);
  Future<void> delete(String id);
}
