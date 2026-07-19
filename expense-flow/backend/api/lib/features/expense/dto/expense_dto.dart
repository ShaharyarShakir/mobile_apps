import '../../../app/exceptions/app_exception.dart';

class CreateExpenseDto {
  final String? categoryId;
  final double amount;
  final String currency;
  final String note;
  final DateTime expenseDate;
  final String? receiptUrl;

  CreateExpenseDto({
    this.categoryId,
    required this.amount,
    required this.currency,
    required this.note,
    required this.expenseDate,
    this.receiptUrl,
  });

  factory CreateExpenseDto.fromJson(Map<String, dynamic> json) {
    final amount = (json['amount'] as num?)?.toDouble();
    if (amount == null || amount <= 0) {
      throw ValidationException('Amount must be greater than 0.');
    }

    final currency = json['currency'] as String?;
    if (currency == null || currency.trim().isEmpty) {
      throw ValidationException('Currency is required.');
    }

    final note = json['note'] as String? ?? '';
    if (note.length > 500) {
      throw ValidationException('Note cannot exceed 500 characters.');
    }

    final expenseDateStr = json['expenseDate'] as String?;
    if (expenseDateStr == null) {
      throw ValidationException('Expense date is required.');
    }

    final expenseDate = DateTime.tryParse(expenseDateStr);
    if (expenseDate == null) {
      throw ValidationException('Invalid expense date format.');
    }

    return CreateExpenseDto(
      categoryId: json['categoryId'] as String?,
      amount: amount,
      currency: currency,
      note: note,
      expenseDate: expenseDate,
      receiptUrl: json['receiptUrl'] as String?,
    );
  }
}

class UpdateExpenseDto {
  final String? categoryId;
  final double? amount;
  final String? currency;
  final String? note;
  final DateTime? expenseDate;
  final String? receiptUrl;

  UpdateExpenseDto({
    this.categoryId,
    this.amount,
    this.currency,
    this.note,
    this.expenseDate,
    this.receiptUrl,
  });

  factory UpdateExpenseDto.fromJson(Map<String, dynamic> json) {
    double? amount;
    if (json.containsKey('amount')) {
      amount = (json['amount'] as num?)?.toDouble();
      if (amount == null || amount <= 0) {
        throw ValidationException('Amount must be greater than 0.');
      }
    }

    String? currency;
    if (json.containsKey('currency')) {
      currency = json['currency'] as String?;
      if (currency == null || currency.trim().isEmpty) {
        throw ValidationException('Currency cannot be empty.');
      }
    }

    String? note;
    if (json.containsKey('note')) {
      note = json['note'] as String?;
      if (note != null && note.length > 500) {
        throw ValidationException('Note cannot exceed 500 characters.');
      }
    }

    DateTime? expenseDate;
    if (json.containsKey('expenseDate')) {
      final expenseDateStr = json['expenseDate'] as String?;
      if (expenseDateStr == null) {
        throw ValidationException('Expense date cannot be null.');
      }
      expenseDate = DateTime.tryParse(expenseDateStr);
      if (expenseDate == null) {
        throw ValidationException('Invalid expense date format.');
      }
    }

    return UpdateExpenseDto(
      categoryId: json.containsKey('categoryId') ? json['categoryId'] as String? : null,
      amount: amount,
      currency: currency,
      note: note,
      expenseDate: expenseDate,
      receiptUrl: json.containsKey('receiptUrl') ? json['receiptUrl'] as String? : null,
    );
  }
}
