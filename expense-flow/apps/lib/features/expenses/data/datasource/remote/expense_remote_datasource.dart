import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path/path.dart' as p;
import 'package:shared_models/shared_models.dart';
import 'package:mobile/core/network/network_client.dart';

class ExpenseRemoteDataSource {
  final NetworkClient _networkClient;

  ExpenseRemoteDataSource(this._networkClient);

  Future<String> uploadReceipt(String expenseId, String filePath) async {
    final file = File(filePath);
    if (!file.existsSync()) {
      throw Exception('Receipt file not found: $filePath');
    }

    final formData = FormData.fromMap({
      'expenseId': expenseId,
      'file': await MultipartFile.fromFile(
        file.path,
        filename: p.basename(file.path),
      ),
    });

    final response = await _networkClient.post<Map<String, dynamic>>(
      '/api/v1/uploads/receipt',
      data: formData,
    );

    final data = response.data?['url'] as String?;
    if (data == null) {
      throw Exception('Failed to upload receipt, url is null');
    }
    return data;
  }

  Future<List<Expense>> getExpenses({
    int? page,
    int? pageSize,
    DateTime? modifiedSince,
    bool? includeDeleted,
  }) async {
    final response = await _networkClient.get<Map<String, dynamic>>(
      '/api/v1/expenses',
      queryParameters: {
        if (page != null) 'page': page,
        if (pageSize != null) 'pageSize': pageSize,
        if (modifiedSince != null) 'modifiedSince': modifiedSince.toIso8601String(),
        if (includeDeleted != null) 'includeDeleted': includeDeleted,
      },
    );

    final list = response.data?['data'] as List<dynamic>? ?? [];
    return list
        .map((json) => Expense.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<Expense> createExpense({
    String? categoryId,
    required double amount,
    required String currency,
    required String note,
    required DateTime expenseDate,
    String? receiptUrl,
  }) async {
    final response = await _networkClient.post<Map<String, dynamic>>(
      '/api/v1/expenses',
      data: {
        if (categoryId != null) 'categoryId': categoryId,
        'amount': amount,
        'currency': currency,
        'note': note,
        'expenseDate': expenseDate.toIso8601String(),
        if (receiptUrl != null) 'receiptUrl': receiptUrl,
      },
    );

    final data = response.data?['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw Exception('Failed to parse created expense data.');
    }
    return Expense.fromJson(data);
  }

  Future<Expense> updateExpense(
    String id, {
    String? categoryId,
    double? amount,
    String? currency,
    String? note,
    DateTime? expenseDate,
    String? receiptUrl,
  }) async {
    final response = await _networkClient.patch<Map<String, dynamic>>(
      '/api/v1/expenses/$id',
      data: {
        if (categoryId != null) 'categoryId': categoryId,
        if (amount != null) 'amount': amount,
        if (currency != null) 'currency': currency,
        if (note != null) 'note': note,
        if (expenseDate != null) 'expenseDate': expenseDate.toIso8601String(),
        if (receiptUrl != null) 'receiptUrl': receiptUrl,
      },
    );

    final data = response.data?['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw Exception('Failed to parse updated expense data.');
    }
    return Expense.fromJson(data);
  }

  Future<void> deleteExpense(String id) async {
    await _networkClient.delete<dynamic>('/api/v1/expenses/$id');
  }
}
