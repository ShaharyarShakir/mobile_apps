import 'package:flutter/material.dart';

enum SortOption {
  newestFirst,
  oldestFirst,
  highestAmount,
  lowestAmount,
  categoryName,
}

class ExpenseFilter {
  final String? categoryId;
  final DateTimeRange? dateRange;
  final double? minAmount;
  final double? maxAmount;
  final SortOption sort;

  const ExpenseFilter({
    this.categoryId,
    this.dateRange,
    this.minAmount,
    this.maxAmount,
    this.sort = SortOption.newestFirst,
  });

  ExpenseFilter copyWith({
    String? categoryId,
    DateTimeRange? dateRange,
    double? minAmount,
    double? maxAmount,
    SortOption? sort,
    bool clearCategory = false,
    bool clearDateRange = false,
  }) {
    return ExpenseFilter(
      categoryId: clearCategory ? null : (categoryId ?? this.categoryId),
      dateRange: clearDateRange ? null : (dateRange ?? this.dateRange),
      minAmount: minAmount ?? this.minAmount,
      maxAmount: maxAmount ?? this.maxAmount,
      sort: sort ?? this.sort,
    );
  }
}
