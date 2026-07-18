import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_models/shared_models.dart';
import 'package:mobile/core/providers/providers.dart';
import 'package:mobile/core/utils/result.dart';
import 'package:mobile/core/services/sync_service.dart';
import '../../data/datasource/local/expense_local_datasource.dart';
import '../../data/datasource/remote/expense_remote_datasource.dart';
import '../../data/repository/expense_repository_impl.dart';
import '../../domain/repository/expense_repository.dart';

import 'package:flutter/material.dart';
import '../../domain/entity/expense_filter.dart';

final expenseRemoteDataSourceProvider = Provider<ExpenseRemoteDataSource>((ref) {
  return ExpenseRemoteDataSource(ref.read(networkClientProvider));
});

final expenseLocalDataSourceProvider = Provider<ExpenseLocalDataSource>((ref) {
  return ExpenseLocalDataSource(ref.read(databaseProvider));
});

final expenseRepositoryProvider = Provider<ExpenseRepository>((ref) {
  return ExpenseRepositoryImpl(
    remoteDataSource: ref.read(expenseRemoteDataSourceProvider),
    localDataSource: ref.read(expenseLocalDataSourceProvider),
  );
});

final expenseListProvider = StreamProvider<List<Expense>>((ref) {
  ref.read(syncServiceProvider.notifier).sync();
  return ref.read(expenseRepositoryProvider).watchExpenses();
});

class ExpenseSearch extends Notifier<String> {
  @override
  String build() => '';

  @override
  set state(String val) => super.state = val;
}

final expenseSearchProvider = NotifierProvider<ExpenseSearch, String>(ExpenseSearch.new);

class ExpenseFilterNotifier extends Notifier<ExpenseFilter> {
  @override
  ExpenseFilter build() => const ExpenseFilter();

  @override
  set state(ExpenseFilter val) => super.state = val;
}

final expenseFilterProvider = NotifierProvider<ExpenseFilterNotifier, ExpenseFilter>(ExpenseFilterNotifier.new);

final filteredExpensesProvider = Provider<AsyncValue<List<Expense>>>((ref) {
  final expensesAsync = ref.watch(expenseListProvider);
  final search = ref.watch(expenseSearchProvider).trim().toLowerCase();
  final filter = ref.watch(expenseFilterProvider);

  return expensesAsync.whenData((expenses) {
    var list = List<Expense>.from(expenses);

    if (search.isNotEmpty) {
      list = list.where((e) {
        final noteMatch = e.note?.toLowerCase().contains(search) ?? false;
        final categoryMatch = e.category?.name.toLowerCase().contains(search) ?? false;
        final amountMatch = e.amount.toString().contains(search);
        return noteMatch || categoryMatch || amountMatch;
      }).toList();
    }

    if (filter.categoryId != null) {
      list = list.where((e) => e.categoryId == filter.categoryId).toList();
    }

    if (filter.dateRange != null) {
      list = list.where((e) {
        final start = filter.dateRange!.start;
        final end = filter.dateRange!.end.add(const Duration(days: 1));
        return e.expenseDate.isAfter(start) && e.expenseDate.isBefore(end);
      }).toList();
    }

    if (filter.minAmount != null) {
      list = list.where((e) => e.amount >= filter.minAmount!).toList();
    }
    if (filter.maxAmount != null) {
      list = list.where((e) => e.amount <= filter.maxAmount!).toList();
    }

    switch (filter.sort) {
      case SortOption.newestFirst:
        list.sort((a, b) => b.expenseDate.compareTo(a.expenseDate));
        break;
      case SortOption.oldestFirst:
        list.sort((a, b) => a.expenseDate.compareTo(b.expenseDate));
        break;
      case SortOption.highestAmount:
        list.sort((a, b) => b.amount.compareTo(a.amount));
        break;
      case SortOption.lowestAmount:
        list.sort((a, b) => a.amount.compareTo(b.amount));
        break;
      case SortOption.categoryName:
        list.sort((a, b) {
          final catA = a.category?.name ?? 'General';
          final catB = b.category?.name ?? 'General';
          return catA.compareTo(catB);
        });
        break;
    }

    return list;
  });
});

class ExpenseController extends AsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<Result<Expense>> createExpense({
    String? categoryId,
    required double amount,
    required String currency,
    required String note,
    required DateTime expenseDate,
    String? receiptUrl,
  }) async {
    state = const AsyncValue.loading();
    final repository = ref.read(expenseRepositoryProvider);
    final result = await repository.createExpense(
      categoryId: categoryId,
      amount: amount,
      currency: currency,
      note: note,
      expenseDate: expenseDate,
      receiptUrl: receiptUrl,
    );
    if (result is Success<Expense>) {
      ref.read(syncServiceProvider.notifier).sync();
    }
    state = const AsyncValue.data(null);
    return result;
  }

  Future<Result<Expense>> updateExpense(
    String id, {
    String? categoryId,
    double? amount,
    String? currency,
    String? note,
    DateTime? expenseDate,
    String? receiptUrl,
  }) async {
    state = const AsyncValue.loading();
    final repository = ref.read(expenseRepositoryProvider);
    final result = await repository.updateExpense(
      id,
      categoryId: categoryId,
      amount: amount,
      currency: currency,
      note: note,
      expenseDate: expenseDate,
      receiptUrl: receiptUrl,
    );
    if (result is Success<Expense>) {
      ref.read(syncServiceProvider.notifier).sync();
    }
    state = const AsyncValue.data(null);
    return result;
  }

  Future<Result<void>> deleteExpense(String id) async {
    state = const AsyncValue.loading();
    final repository = ref.read(expenseRepositoryProvider);
    final result = await repository.deleteExpense(id);
    if (result is Success<void>) {
      ref.read(syncServiceProvider.notifier).sync();
    }
    state = const AsyncValue.data(null);
    return result;
  }
}

final expenseControllerProvider =
    AsyncNotifierProvider.autoDispose<ExpenseController, void>(
  ExpenseController.new,
);

class GroupedExpenseItem {
  final String? header;
  final Expense? expense;

  GroupedExpenseItem.header(this.header) : expense = null;
  GroupedExpenseItem.expense(this.expense) : header = null;
}

final groupedExpensesProvider = Provider<AsyncValue<Map<String, List<Expense>>>>((ref) {
  final filteredExpensesAsync = ref.watch(filteredExpensesProvider);

  return filteredExpensesAsync.whenData((expenses) {
    final Map<String, List<Expense>> groups = {};
    for (final expense in expenses) {
      final date = expense.expenseDate;
      final key = '${_getMonthName(date.month)} ${date.year}';
      if (!groups.containsKey(key)) {
        groups[key] = [];
      }
      groups[key]!.add(expense);
    }
    return groups;
  });
});

final flattenedGroupedExpensesProvider = Provider<AsyncValue<List<GroupedExpenseItem>>>((ref) {
  final groupedAsync = ref.watch(groupedExpensesProvider);

  return groupedAsync.whenData((groups) {
    final List<GroupedExpenseItem> flattened = [];
    groups.forEach((monthYear, list) {
      flattened.add(GroupedExpenseItem.header(monthYear));
      for (final e in list) {
        flattened.add(GroupedExpenseItem.expense(e));
      }
    });
    return flattened;
  });
});

String _getMonthName(int month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}
