import 'package:api/shared/models/models.dart';
import 'package:api/shared/repositories/repositories.dart';
import 'package:stormberry/stormberry.dart';

class UserRepositoryImpl implements UserRepository {
  UserRepositoryImpl(this._session);

  final Session _session;

  @override
  Future<DbUserView?> getById(String id) {
    return _session.dbUsers.queryDbUser(id);
  }

  @override
  Future<DbUserView?> getByEmail(String email) async {
    final list = await _session.dbUsers.queryDbUsers(
      QueryParams(
        where: 'email = @email',
        values: {'email': email},
      ),
    );
    return list.isEmpty ? null : list.first;
  }

  @override
  Future<void> create(DbUser user) {
    return _session.dbUsers.insertOne(
      DbUserInsertRequest(
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      ),
    );
  }

  @override
  Future<void> update(DbUser user) {
    return _session.dbUsers.updateOne(
      DbUserUpdateRequest(
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      ),
    );
  }

  @override
  Future<void> delete(String id) {
    return _session.dbUsers.deleteOne(id);
  }
}

class CategoryRepositoryImpl implements CategoryRepository {
  CategoryRepositoryImpl(this._session);

  final Session _session;

  @override
  Future<DbCategoryView?> getById(String id) {
    return _session.dbCategories.queryDbCategory(id);
  }

  @override
  Future<List<DbCategoryView>> getByUserId(String userId) {
    return _session.dbCategories.queryDbCategorys(
      QueryParams(
        where: 'user_id = @userId',
        values: {'userId': userId},
      ),
    );
  }

  @override
  Future<void> create(DbCategory category) {
    return _session.dbCategories.insertOne(
      DbCategoryInsertRequest(
        id: category.id,
        userId: category.userId,
        name: category.name,
        icon: category.icon,
        color: category.color,
      ),
    );
  }

  @override
  Future<void> update(DbCategory category) {
    return _session.dbCategories.updateOne(
      DbCategoryUpdateRequest(
        id: category.id,
        userId: category.userId,
        name: category.name,
        icon: category.icon,
        color: category.color,
      ),
    );
  }

  @override
  Future<void> delete(String id) {
    return _session.dbCategories.deleteOne(id);
  }
}

class ExpenseRepositoryImpl implements ExpenseRepository {
  ExpenseRepositoryImpl(this._session);

  final Session _session;

  @override
  Future<DbExpenseView?> getById(String id) {
    return _session.dbExpenses.queryDbExpense(id);
  }

  @override
  Future<List<DbExpenseView>> getByUserId(
    String userId, {
    int? limit,
    int? offset,
    bool includeDeleted = false,
    DateTime? modifiedSince,
  }) {
    var whereClause = includeDeleted
        ? 'user_id = @userId'
        : 'user_id = @userId AND deleted_at IS NULL';

    final values = <String, dynamic>{'userId': userId};

    if (modifiedSince != null) {
      whereClause +=
          ' AND (updated_at >= @modifiedSince OR (updated_at IS NULL AND created_at >= @modifiedSince))';
      values['modifiedSince'] = modifiedSince;
    }

    return _session.dbExpenses.queryDbExpenses(
      QueryParams(
        where: whereClause,
        values: values,
        limit: limit,
        offset: offset,
        orderBy: 'expense_date DESC',
      ),
    );
  }

  @override
  Future<void> create(DbExpense expense) {
    return _session.dbExpenses.insertOne(
      DbExpenseInsertRequest(
        id: expense.id,
        userId: expense.userId,
        categoryId: expense.categoryId,
        amount: expense.amount,
        currency: expense.currency,
        note: expense.note,
        expenseDate: expense.expenseDate,
        receiptUrl: expense.receiptUrl,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
        deletedAt: expense.deletedAt,
      ),
    );
  }

  @override
  Future<void> update(DbExpense expense) {
    return _session.dbExpenses.updateOne(
      DbExpenseUpdateRequest(
        id: expense.id,
        userId: expense.userId,
        categoryId: expense.categoryId,
        amount: expense.amount,
        currency: expense.currency,
        note: expense.note,
        expenseDate: expense.expenseDate,
        receiptUrl: expense.receiptUrl,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
        deletedAt: expense.deletedAt,
      ),
    );
  }

  @override
  Future<void> delete(String id) {
    return _session.dbExpenses.deleteOne(id);
  }
}

class IncomeRepositoryImpl implements IncomeRepository {
  IncomeRepositoryImpl(this._session);

  final Session _session;

  @override
  Future<DbIncomeView?> getById(String id) {
    return _session.dbIncomes.queryDbIncome(id);
  }

  @override
  Future<List<DbIncomeView>> getByUserId(String userId) {
    return _session.dbIncomes.queryDbIncomes(
      QueryParams(
        where: 'user_id = @userId',
        values: {'userId': userId},
      ),
    );
  }

  @override
  Future<void> create(DbIncome income) {
    return _session.dbIncomes.insertOne(
      DbIncomeInsertRequest(
        id: income.id,
        userId: income.userId,
        amount: income.amount,
        source: income.source,
        incomeDate: income.incomeDate,
      ),
    );
  }

  @override
  Future<void> update(DbIncome income) {
    return _session.dbIncomes.updateOne(
      DbIncomeUpdateRequest(
        id: income.id,
        userId: income.userId,
        amount: income.amount,
        source: income.source,
        incomeDate: income.incomeDate,
      ),
    );
  }

  @override
  Future<void> delete(String id) {
    return _session.dbIncomes.deleteOne(id);
  }
}

class BudgetRepositoryImpl implements BudgetRepository {
  BudgetRepositoryImpl(this._session);

  final Session _session;

  @override
  Future<DbBudgetView?> getById(String id) {
    return _session.dbBudgets.queryDbBudget(id);
  }

  @override
  Future<List<DbBudgetView>> getByUserId(String userId) {
    return _session.dbBudgets.queryDbBudgets(
      QueryParams(
        where: 'user_id = @userId',
        values: {'userId': userId},
      ),
    );
  }

  @override
  Future<void> create(DbBudget budget) {
    return _session.dbBudgets.insertOne(
      DbBudgetInsertRequest(
        id: budget.id,
        userId: budget.userId,
        categoryId: budget.categoryId,
        limit: budget.limit,
        month: budget.month,
        year: budget.year,
      ),
    );
  }

  @override
  Future<void> update(DbBudget budget) {
    return _session.dbBudgets.updateOne(
      DbBudgetUpdateRequest(
        id: budget.id,
        userId: budget.userId,
        categoryId: budget.categoryId,
        limit: budget.limit,
        month: budget.month,
        year: budget.year,
      ),
    );
  }

  @override
  Future<void> delete(String id) {
    return _session.dbBudgets.deleteOne(id);
  }
}
