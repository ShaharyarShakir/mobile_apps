import 'package:stormberry/stormberry.dart';

part 'models.schema.dart';

@Model(tableName: 'users')
abstract class DbUser {
  @PrimaryKey()
  String get id;
  String get name;
  String get email;
  String get passwordHash;
  DateTime get createdAt;
}

@Model(tableName: 'categories')
abstract class DbCategory {
  @PrimaryKey()
  String get id;
  String get userId;
  String get name;
  String get icon;
  int get color;
}

@Model(tableName: 'expenses')
abstract class DbExpense {
  @PrimaryKey()
  String get id;
  String get userId;
  String? get categoryId;
  double get amount;
  String get currency;
  String? get note;
  DateTime get expenseDate;
  String? get receiptUrl;
  DateTime get createdAt;
  DateTime? get updatedAt;
  DateTime? get deletedAt;
}

@Model(tableName: 'income')
abstract class DbIncome {
  @PrimaryKey()
  String get id;
  String get userId;
  double get amount;
  String get source;
  DateTime get incomeDate;
}

@Model(tableName: 'budgets')
abstract class DbBudget {
  @PrimaryKey()
  String get id;
  String get userId;
  String get categoryId;
  double get limit;
  int get month;
  int get year;
}

class Expense implements DbExpense {
  @override
  final String id;
  @override
  final String userId;
  @override
  final String? categoryId;
  @override
  final double amount;
  @override
  final String currency;
  @override
  final String? note;
  @override
  final DateTime expenseDate;
  @override
  final String? receiptUrl;
  @override
  final DateTime createdAt;
  @override
  final DateTime? updatedAt;
  @override
  final DateTime? deletedAt;

  Expense({
    required this.id,
    required this.userId,
    this.categoryId,
    required this.amount,
    required this.currency,
    this.note,
    required this.expenseDate,
    this.receiptUrl,
    required this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });
}

class Category implements DbCategory {
  @override
  final String id;
  @override
  final String userId;
  @override
  final String name;
  @override
  final String icon;
  @override
  final int color;

  Category({
    required this.id,
    required this.userId,
    required this.name,
    required this.icon,
    required this.color,
  });
}
