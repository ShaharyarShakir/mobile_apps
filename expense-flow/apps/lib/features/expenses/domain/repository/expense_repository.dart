import 'package:shared_models/shared_models.dart';
import '../../../../core/utils/result.dart';

abstract class ExpenseRepository {
  Stream<List<Expense>> watchExpenses();
  Future<Result<List<Expense>>> getExpenses({int? page, int? pageSize});
  Future<Result<Expense>> getExpenseById(String id);
  Future<Result<Expense>> createExpense({
    String? categoryId,
    required double amount,
    required String currency,
    required String note,
    required DateTime expenseDate,
    String? receiptUrl,
  });
  Future<Result<Expense>> updateExpense(
    String id, {
    String? categoryId,
    double? amount,
    String? currency,
    String? note,
    DateTime? expenseDate,
    String? receiptUrl,
  });
  Future<Result<void>> deleteExpense(String id);
}
