// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: type=lint
// ignore_for_file: annotate_overrides
// dart format off

part of 'models.dart';

extension ModelsRepositories on Session {
  DbUserRepository get dbUsers => DbUserRepository._(this);
  DbCategoryRepository get dbCategories => DbCategoryRepository._(this);
  DbExpenseRepository get dbExpenses => DbExpenseRepository._(this);
  DbIncomeRepository get dbIncomes => DbIncomeRepository._(this);
  DbBudgetRepository get dbBudgets => DbBudgetRepository._(this);
}

abstract class DbUserRepository
    implements
        ModelRepository,
        ModelRepositoryInsert<DbUserInsertRequest>,
        ModelRepositoryUpdate<DbUserUpdateRequest>,
        ModelRepositoryDelete<String> {
  factory DbUserRepository._(Session db) = _DbUserRepository;

  Future<DbUserView?> queryDbUser(String id);
  Future<List<DbUserView>> queryDbUsers([QueryParams? params]);
}

class _DbUserRepository extends BaseRepository
    with
        RepositoryInsertMixin<DbUserInsertRequest>,
        RepositoryUpdateMixin<DbUserUpdateRequest>,
        RepositoryDeleteMixin<String>
    implements DbUserRepository {
  _DbUserRepository(super.db) : super(tableName: 'users', keyName: 'id');

  @override
  Future<DbUserView?> queryDbUser(String id) {
    return queryOne(id, DbUserViewQueryable());
  }

  @override
  Future<List<DbUserView>> queryDbUsers([QueryParams? params]) {
    return queryMany(DbUserViewQueryable(), params);
  }

  @override
  Future<void> insert(List<DbUserInsertRequest> requests) async {
    if (requests.isEmpty) return;
    var values = QueryValues();
    await db.execute(
      Sql.named(
        'INSERT INTO "users" ( "id", "name", "email", "password_hash", "created_at" )\n'
        'VALUES ${requests.map((r) => '( ${values.add(r.id)}:text, ${values.add(r.name)}:text, ${values.add(r.email)}:text, ${values.add(r.passwordHash)}:text, ${values.add(r.createdAt)}:timestamp )').join(', ')}\n',
      ),
      parameters: values.values,
    );
  }

  @override
  Future<void> update(List<DbUserUpdateRequest> requests) async {
    if (requests.isEmpty) return;

    final updateRequests = [
      for (final r in requests)
        if (r.name != null ||
            r.email != null ||
            r.passwordHash != null ||
            r.createdAt != null)
          r,
    ];

    if (updateRequests.isNotEmpty) {
      var values = QueryValues();
      await db.execute(
        Sql.named(
          'UPDATE "users"\n'
          'SET "name" = COALESCE(UPDATED."name", "users"."name"), "email" = COALESCE(UPDATED."email", "users"."email"), "password_hash" = COALESCE(UPDATED."password_hash", "users"."password_hash"), "created_at" = COALESCE(UPDATED."created_at", "users"."created_at")\n'
          'FROM ( VALUES ${updateRequests.map((r) => '( ${values.add(r.id)}:text::text, ${values.add(r.name)}:text::text, ${values.add(r.email)}:text::text, ${values.add(r.passwordHash)}:text::text, ${values.add(r.createdAt)}:timestamp::timestamp )').join(', ')} )\n'
          'AS UPDATED("id", "name", "email", "password_hash", "created_at")\n'
          'WHERE "users"."id" = UPDATED."id"',
        ),
        parameters: values.values,
      );
    }
  }
}

abstract class DbCategoryRepository
    implements
        ModelRepository,
        ModelRepositoryInsert<DbCategoryInsertRequest>,
        ModelRepositoryUpdate<DbCategoryUpdateRequest>,
        ModelRepositoryDelete<String> {
  factory DbCategoryRepository._(Session db) = _DbCategoryRepository;

  Future<DbCategoryView?> queryDbCategory(String id);
  Future<List<DbCategoryView>> queryDbCategorys([QueryParams? params]);
}

class _DbCategoryRepository extends BaseRepository
    with
        RepositoryInsertMixin<DbCategoryInsertRequest>,
        RepositoryUpdateMixin<DbCategoryUpdateRequest>,
        RepositoryDeleteMixin<String>
    implements DbCategoryRepository {
  _DbCategoryRepository(super.db)
    : super(tableName: 'categories', keyName: 'id');

  @override
  Future<DbCategoryView?> queryDbCategory(String id) {
    return queryOne(id, DbCategoryViewQueryable());
  }

  @override
  Future<List<DbCategoryView>> queryDbCategorys([QueryParams? params]) {
    return queryMany(DbCategoryViewQueryable(), params);
  }

  @override
  Future<void> insert(List<DbCategoryInsertRequest> requests) async {
    if (requests.isEmpty) return;
    var values = QueryValues();
    await db.execute(
      Sql.named(
        'INSERT INTO "categories" ( "id", "user_id", "name", "icon", "color" )\n'
        'VALUES ${requests.map((r) => '( ${values.add(r.id)}:text, ${values.add(r.userId)}:text, ${values.add(r.name)}:text, ${values.add(r.icon)}:text, ${values.add(r.color)}:int8 )').join(', ')}\n',
      ),
      parameters: values.values,
    );
  }

  @override
  Future<void> update(List<DbCategoryUpdateRequest> requests) async {
    if (requests.isEmpty) return;

    final updateRequests = [
      for (final r in requests)
        if (r.userId != null ||
            r.name != null ||
            r.icon != null ||
            r.color != null)
          r,
    ];

    if (updateRequests.isNotEmpty) {
      var values = QueryValues();
      await db.execute(
        Sql.named(
          'UPDATE "categories"\n'
          'SET "user_id" = COALESCE(UPDATED."user_id", "categories"."user_id"), "name" = COALESCE(UPDATED."name", "categories"."name"), "icon" = COALESCE(UPDATED."icon", "categories"."icon"), "color" = COALESCE(UPDATED."color", "categories"."color")\n'
          'FROM ( VALUES ${updateRequests.map((r) => '( ${values.add(r.id)}:text::text, ${values.add(r.userId)}:text::text, ${values.add(r.name)}:text::text, ${values.add(r.icon)}:text::text, ${values.add(r.color)}:int8::int8 )').join(', ')} )\n'
          'AS UPDATED("id", "user_id", "name", "icon", "color")\n'
          'WHERE "categories"."id" = UPDATED."id"',
        ),
        parameters: values.values,
      );
    }
  }
}

abstract class DbExpenseRepository
    implements
        ModelRepository,
        ModelRepositoryInsert<DbExpenseInsertRequest>,
        ModelRepositoryUpdate<DbExpenseUpdateRequest>,
        ModelRepositoryDelete<String> {
  factory DbExpenseRepository._(Session db) = _DbExpenseRepository;

  Future<DbExpenseView?> queryDbExpense(String id);
  Future<List<DbExpenseView>> queryDbExpenses([QueryParams? params]);
}

class _DbExpenseRepository extends BaseRepository
    with
        RepositoryInsertMixin<DbExpenseInsertRequest>,
        RepositoryUpdateMixin<DbExpenseUpdateRequest>,
        RepositoryDeleteMixin<String>
    implements DbExpenseRepository {
  _DbExpenseRepository(super.db) : super(tableName: 'expenses', keyName: 'id');

  @override
  Future<DbExpenseView?> queryDbExpense(String id) {
    return queryOne(id, DbExpenseViewQueryable());
  }

  @override
  Future<List<DbExpenseView>> queryDbExpenses([QueryParams? params]) {
    return queryMany(DbExpenseViewQueryable(), params);
  }

  @override
  Future<void> insert(List<DbExpenseInsertRequest> requests) async {
    if (requests.isEmpty) return;
    var values = QueryValues();
    await db.execute(
      Sql.named(
        'INSERT INTO "expenses" ( "id", "user_id", "deleted_at", "category_id", "amount", "currency", "note", "expense_date", "receipt_url", "created_at", "updated_at" )\n'
        'VALUES ${requests.map((r) => '( ${values.add(r.id)}:text, ${values.add(r.userId)}:text, ${values.add(r.deletedAt)}:timestamp, ${values.add(r.categoryId)}:text, ${values.add(r.amount)}:float8, ${values.add(r.currency)}:text, ${values.add(r.note)}:text, ${values.add(r.expenseDate)}:timestamp, ${values.add(r.receiptUrl)}:text, ${values.add(r.createdAt)}:timestamp, ${values.add(r.updatedAt)}:timestamp )').join(', ')}\n',
      ),
      parameters: values.values,
    );
  }

  @override
  Future<void> update(List<DbExpenseUpdateRequest> requests) async {
    if (requests.isEmpty) return;

    final updateRequests = [
      for (final r in requests)
        if (r.userId != null ||
            r.deletedAt != null ||
            r.categoryId != null ||
            r.amount != null ||
            r.currency != null ||
            r.note != null ||
            r.expenseDate != null ||
            r.receiptUrl != null ||
            r.createdAt != null ||
            r.updatedAt != null)
          r,
    ];

    if (updateRequests.isNotEmpty) {
      var values = QueryValues();
      await db.execute(
        Sql.named(
          'UPDATE "expenses"\n'
          'SET "user_id" = COALESCE(UPDATED."user_id", "expenses"."user_id"), "deleted_at" = COALESCE(UPDATED."deleted_at", "expenses"."deleted_at"), "category_id" = COALESCE(UPDATED."category_id", "expenses"."category_id"), "amount" = COALESCE(UPDATED."amount", "expenses"."amount"), "currency" = COALESCE(UPDATED."currency", "expenses"."currency"), "note" = COALESCE(UPDATED."note", "expenses"."note"), "expense_date" = COALESCE(UPDATED."expense_date", "expenses"."expense_date"), "receipt_url" = COALESCE(UPDATED."receipt_url", "expenses"."receipt_url"), "created_at" = COALESCE(UPDATED."created_at", "expenses"."created_at"), "updated_at" = COALESCE(UPDATED."updated_at", "expenses"."updated_at")\n'
          'FROM ( VALUES ${updateRequests.map((r) => '( ${values.add(r.id)}:text::text, ${values.add(r.userId)}:text::text, ${values.add(r.deletedAt)}:timestamp::timestamp, ${values.add(r.categoryId)}:text::text, ${values.add(r.amount)}:float8::float8, ${values.add(r.currency)}:text::text, ${values.add(r.note)}:text::text, ${values.add(r.expenseDate)}:timestamp::timestamp, ${values.add(r.receiptUrl)}:text::text, ${values.add(r.createdAt)}:timestamp::timestamp, ${values.add(r.updatedAt)}:timestamp::timestamp )').join(', ')} )\n'
          'AS UPDATED("id", "user_id", "deleted_at", "category_id", "amount", "currency", "note", "expense_date", "receipt_url", "created_at", "updated_at")\n'
          'WHERE "expenses"."id" = UPDATED."id"',
        ),
        parameters: values.values,
      );
    }
  }
}

abstract class DbIncomeRepository
    implements
        ModelRepository,
        ModelRepositoryInsert<DbIncomeInsertRequest>,
        ModelRepositoryUpdate<DbIncomeUpdateRequest>,
        ModelRepositoryDelete<String> {
  factory DbIncomeRepository._(Session db) = _DbIncomeRepository;

  Future<DbIncomeView?> queryDbIncome(String id);
  Future<List<DbIncomeView>> queryDbIncomes([QueryParams? params]);
}

class _DbIncomeRepository extends BaseRepository
    with
        RepositoryInsertMixin<DbIncomeInsertRequest>,
        RepositoryUpdateMixin<DbIncomeUpdateRequest>,
        RepositoryDeleteMixin<String>
    implements DbIncomeRepository {
  _DbIncomeRepository(super.db) : super(tableName: 'income', keyName: 'id');

  @override
  Future<DbIncomeView?> queryDbIncome(String id) {
    return queryOne(id, DbIncomeViewQueryable());
  }

  @override
  Future<List<DbIncomeView>> queryDbIncomes([QueryParams? params]) {
    return queryMany(DbIncomeViewQueryable(), params);
  }

  @override
  Future<void> insert(List<DbIncomeInsertRequest> requests) async {
    if (requests.isEmpty) return;
    var values = QueryValues();
    await db.execute(
      Sql.named(
        'INSERT INTO "income" ( "id", "user_id", "amount", "source", "income_date" )\n'
        'VALUES ${requests.map((r) => '( ${values.add(r.id)}:text, ${values.add(r.userId)}:text, ${values.add(r.amount)}:float8, ${values.add(r.source)}:text, ${values.add(r.incomeDate)}:timestamp )').join(', ')}\n',
      ),
      parameters: values.values,
    );
  }

  @override
  Future<void> update(List<DbIncomeUpdateRequest> requests) async {
    if (requests.isEmpty) return;

    final updateRequests = [
      for (final r in requests)
        if (r.userId != null ||
            r.amount != null ||
            r.source != null ||
            r.incomeDate != null)
          r,
    ];

    if (updateRequests.isNotEmpty) {
      var values = QueryValues();
      await db.execute(
        Sql.named(
          'UPDATE "income"\n'
          'SET "user_id" = COALESCE(UPDATED."user_id", "income"."user_id"), "amount" = COALESCE(UPDATED."amount", "income"."amount"), "source" = COALESCE(UPDATED."source", "income"."source"), "income_date" = COALESCE(UPDATED."income_date", "income"."income_date")\n'
          'FROM ( VALUES ${updateRequests.map((r) => '( ${values.add(r.id)}:text::text, ${values.add(r.userId)}:text::text, ${values.add(r.amount)}:float8::float8, ${values.add(r.source)}:text::text, ${values.add(r.incomeDate)}:timestamp::timestamp )').join(', ')} )\n'
          'AS UPDATED("id", "user_id", "amount", "source", "income_date")\n'
          'WHERE "income"."id" = UPDATED."id"',
        ),
        parameters: values.values,
      );
    }
  }
}

abstract class DbBudgetRepository
    implements
        ModelRepository,
        ModelRepositoryInsert<DbBudgetInsertRequest>,
        ModelRepositoryUpdate<DbBudgetUpdateRequest>,
        ModelRepositoryDelete<String> {
  factory DbBudgetRepository._(Session db) = _DbBudgetRepository;

  Future<DbBudgetView?> queryDbBudget(String id);
  Future<List<DbBudgetView>> queryDbBudgets([QueryParams? params]);
}

class _DbBudgetRepository extends BaseRepository
    with
        RepositoryInsertMixin<DbBudgetInsertRequest>,
        RepositoryUpdateMixin<DbBudgetUpdateRequest>,
        RepositoryDeleteMixin<String>
    implements DbBudgetRepository {
  _DbBudgetRepository(super.db) : super(tableName: 'budgets', keyName: 'id');

  @override
  Future<DbBudgetView?> queryDbBudget(String id) {
    return queryOne(id, DbBudgetViewQueryable());
  }

  @override
  Future<List<DbBudgetView>> queryDbBudgets([QueryParams? params]) {
    return queryMany(DbBudgetViewQueryable(), params);
  }

  @override
  Future<void> insert(List<DbBudgetInsertRequest> requests) async {
    if (requests.isEmpty) return;
    var values = QueryValues();
    await db.execute(
      Sql.named(
        'INSERT INTO "budgets" ( "id", "user_id", "category_id", "limit", "month", "year" )\n'
        'VALUES ${requests.map((r) => '( ${values.add(r.id)}:text, ${values.add(r.userId)}:text, ${values.add(r.categoryId)}:text, ${values.add(r.limit)}:float8, ${values.add(r.month)}:int8, ${values.add(r.year)}:int8 )').join(', ')}\n',
      ),
      parameters: values.values,
    );
  }

  @override
  Future<void> update(List<DbBudgetUpdateRequest> requests) async {
    if (requests.isEmpty) return;

    final updateRequests = [
      for (final r in requests)
        if (r.userId != null ||
            r.categoryId != null ||
            r.limit != null ||
            r.month != null ||
            r.year != null)
          r,
    ];

    if (updateRequests.isNotEmpty) {
      var values = QueryValues();
      await db.execute(
        Sql.named(
          'UPDATE "budgets"\n'
          'SET "user_id" = COALESCE(UPDATED."user_id", "budgets"."user_id"), "category_id" = COALESCE(UPDATED."category_id", "budgets"."category_id"), "limit" = COALESCE(UPDATED."limit", "budgets"."limit"), "month" = COALESCE(UPDATED."month", "budgets"."month"), "year" = COALESCE(UPDATED."year", "budgets"."year")\n'
          'FROM ( VALUES ${updateRequests.map((r) => '( ${values.add(r.id)}:text::text, ${values.add(r.userId)}:text::text, ${values.add(r.categoryId)}:text::text, ${values.add(r.limit)}:float8::float8, ${values.add(r.month)}:int8::int8, ${values.add(r.year)}:int8::int8 )').join(', ')} )\n'
          'AS UPDATED("id", "user_id", "category_id", "limit", "month", "year")\n'
          'WHERE "budgets"."id" = UPDATED."id"',
        ),
        parameters: values.values,
      );
    }
  }
}

class DbUserInsertRequest {
  DbUserInsertRequest({
    required this.id,
    required this.name,
    required this.email,
    required this.passwordHash,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String email;
  final String passwordHash;
  final DateTime createdAt;
}

class DbCategoryInsertRequest {
  DbCategoryInsertRequest({
    required this.id,
    required this.userId,
    required this.name,
    required this.icon,
    required this.color,
  });

  final String id;
  final String userId;
  final String name;
  final String icon;
  final int color;
}

class DbExpenseInsertRequest {
  DbExpenseInsertRequest({
    required this.id,
    required this.userId,
    this.deletedAt,
    this.categoryId,
    required this.amount,
    required this.currency,
    this.note,
    required this.expenseDate,
    this.receiptUrl,
    required this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final DateTime? deletedAt;
  final String? categoryId;
  final double amount;
  final String currency;
  final String? note;
  final DateTime expenseDate;
  final String? receiptUrl;
  final DateTime createdAt;
  final DateTime? updatedAt;
}

class DbIncomeInsertRequest {
  DbIncomeInsertRequest({
    required this.id,
    required this.userId,
    required this.amount,
    required this.source,
    required this.incomeDate,
  });

  final String id;
  final String userId;
  final double amount;
  final String source;
  final DateTime incomeDate;
}

class DbBudgetInsertRequest {
  DbBudgetInsertRequest({
    required this.id,
    required this.userId,
    required this.categoryId,
    required this.limit,
    required this.month,
    required this.year,
  });

  final String id;
  final String userId;
  final String categoryId;
  final double limit;
  final int month;
  final int year;
}

class DbUserUpdateRequest {
  DbUserUpdateRequest({
    required this.id,
    this.name,
    this.email,
    this.passwordHash,
    this.createdAt,
  });

  final String id;
  final String? name;
  final String? email;
  final String? passwordHash;
  final DateTime? createdAt;
}

class DbCategoryUpdateRequest {
  DbCategoryUpdateRequest({
    required this.id,
    this.userId,
    this.name,
    this.icon,
    this.color,
  });

  final String id;
  final String? userId;
  final String? name;
  final String? icon;
  final int? color;
}

class DbExpenseUpdateRequest {
  DbExpenseUpdateRequest({
    required this.id,
    this.userId,
    this.deletedAt,
    this.categoryId,
    this.amount,
    this.currency,
    this.note,
    this.expenseDate,
    this.receiptUrl,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String? userId;
  final DateTime? deletedAt;
  final String? categoryId;
  final double? amount;
  final String? currency;
  final String? note;
  final DateTime? expenseDate;
  final String? receiptUrl;
  final DateTime? createdAt;
  final DateTime? updatedAt;
}

class DbIncomeUpdateRequest {
  DbIncomeUpdateRequest({
    required this.id,
    this.userId,
    this.amount,
    this.source,
    this.incomeDate,
  });

  final String id;
  final String? userId;
  final double? amount;
  final String? source;
  final DateTime? incomeDate;
}

class DbBudgetUpdateRequest {
  DbBudgetUpdateRequest({
    required this.id,
    this.userId,
    this.categoryId,
    this.limit,
    this.month,
    this.year,
  });

  final String id;
  final String? userId;
  final String? categoryId;
  final double? limit;
  final int? month;
  final int? year;
}

class DbUserViewQueryable extends KeyedViewQueryable<DbUserView, String> {
  @override
  String get keyName => 'id';

  @override
  String encodeKey(String key) => TextEncoder.i.encode(key);

  @override
  String get query =>
      'SELECT "users".*'
      'FROM "users"';

  @override
  String get tableAlias => 'users';

  @override
  DbUserView decode(TypedMap map) => DbUserView(
    id: map.get('id'),
    name: map.get('name'),
    email: map.get('email'),
    passwordHash: map.get('password_hash'),
    createdAt: map.get('created_at'),
  );
}

class DbUserView {
  DbUserView({
    required this.id,
    required this.name,
    required this.email,
    required this.passwordHash,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String email;
  final String passwordHash;
  final DateTime createdAt;
}

class DbCategoryViewQueryable
    extends KeyedViewQueryable<DbCategoryView, String> {
  @override
  String get keyName => 'id';

  @override
  String encodeKey(String key) => TextEncoder.i.encode(key);

  @override
  String get query =>
      'SELECT "categories".*'
      'FROM "categories"';

  @override
  String get tableAlias => 'categories';

  @override
  DbCategoryView decode(TypedMap map) => DbCategoryView(
    id: map.get('id'),
    userId: map.get('user_id'),
    name: map.get('name'),
    icon: map.get('icon'),
    color: map.get('color'),
  );
}

class DbCategoryView {
  DbCategoryView({
    required this.id,
    required this.userId,
    required this.name,
    required this.icon,
    required this.color,
  });

  final String id;
  final String userId;
  final String name;
  final String icon;
  final int color;
}

class DbExpenseViewQueryable extends KeyedViewQueryable<DbExpenseView, String> {
  @override
  String get keyName => 'id';

  @override
  String encodeKey(String key) => TextEncoder.i.encode(key);

  @override
  String get query =>
      'SELECT "expenses".*'
      'FROM "expenses"';

  @override
  String get tableAlias => 'expenses';

  @override
  DbExpenseView decode(TypedMap map) => DbExpenseView(
    id: map.get('id'),
    userId: map.get('user_id'),
    deletedAt: map.getOpt('deleted_at'),
    categoryId: map.getOpt('category_id'),
    amount: map.get('amount'),
    currency: map.get('currency'),
    note: map.getOpt('note'),
    expenseDate: map.get('expense_date'),
    receiptUrl: map.getOpt('receipt_url'),
    createdAt: map.get('created_at'),
    updatedAt: map.getOpt('updated_at'),
  );
}

class DbExpenseView {
  DbExpenseView({
    required this.id,
    required this.userId,
    this.deletedAt,
    this.categoryId,
    required this.amount,
    required this.currency,
    this.note,
    required this.expenseDate,
    this.receiptUrl,
    required this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final DateTime? deletedAt;
  final String? categoryId;
  final double amount;
  final String currency;
  final String? note;
  final DateTime expenseDate;
  final String? receiptUrl;
  final DateTime createdAt;
  final DateTime? updatedAt;
}

class DbIncomeViewQueryable extends KeyedViewQueryable<DbIncomeView, String> {
  @override
  String get keyName => 'id';

  @override
  String encodeKey(String key) => TextEncoder.i.encode(key);

  @override
  String get query =>
      'SELECT "income".*'
      'FROM "income"';

  @override
  String get tableAlias => 'income';

  @override
  DbIncomeView decode(TypedMap map) => DbIncomeView(
    id: map.get('id'),
    userId: map.get('user_id'),
    amount: map.get('amount'),
    source: map.get('source'),
    incomeDate: map.get('income_date'),
  );
}

class DbIncomeView {
  DbIncomeView({
    required this.id,
    required this.userId,
    required this.amount,
    required this.source,
    required this.incomeDate,
  });

  final String id;
  final String userId;
  final double amount;
  final String source;
  final DateTime incomeDate;
}

class DbBudgetViewQueryable extends KeyedViewQueryable<DbBudgetView, String> {
  @override
  String get keyName => 'id';

  @override
  String encodeKey(String key) => TextEncoder.i.encode(key);

  @override
  String get query =>
      'SELECT "budgets".*'
      'FROM "budgets"';

  @override
  String get tableAlias => 'budgets';

  @override
  DbBudgetView decode(TypedMap map) => DbBudgetView(
    id: map.get('id'),
    userId: map.get('user_id'),
    categoryId: map.get('category_id'),
    limit: map.get('limit'),
    month: map.get('month'),
    year: map.get('year'),
  );
}

class DbBudgetView {
  DbBudgetView({
    required this.id,
    required this.userId,
    required this.categoryId,
    required this.limit,
    required this.month,
    required this.year,
  });

  final String id;
  final String userId;
  final String categoryId;
  final double limit;
  final int month;
  final int year;
}
