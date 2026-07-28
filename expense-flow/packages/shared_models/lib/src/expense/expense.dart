import 'package:freezed_annotation/freezed_annotation.dart';
import 'category.dart';

part 'expense.freezed.dart';
part 'expense.g.dart';

@freezed
abstract class Expense with _$Expense {
  const factory Expense({
    required String id,
    required String userId,
    String? categoryId,
    required double amount,
    required String currency,
    required DateTime expenseDate,
    String? note,
    Category? category,
    String? receiptUrl,
    String? syncStatus,
    required DateTime createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
  }) = _Expense;

  factory Expense.fromJson(Map<String, dynamic> json) =>
      _$ExpenseFromJson(json);
}
