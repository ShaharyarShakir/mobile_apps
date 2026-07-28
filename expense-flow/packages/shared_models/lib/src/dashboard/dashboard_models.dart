class DashboardSummary {
  final double income;
  final double expenses;
  final double savings;
  final double balance;

  const DashboardSummary({
    required this.income,
    required this.expenses,
    required this.savings,
    required this.balance,
  });

  factory DashboardSummary.zero() => const DashboardSummary(
        income: 0.0,
        expenses: 0.0,
        savings: 0.0,
        balance: 0.0,
      );
}

class CategorySummary {
  final String categoryName;
  final int categoryColor;
  final String categoryIcon;
  final double total;
  final double percentage;

  const CategorySummary({
    required this.categoryName,
    required this.categoryColor,
    required this.categoryIcon,
    required this.total,
    required this.percentage,
  });
}

class MonthlyTrend {
  final DateTime day;
  final double total;

  const MonthlyTrend({
    required this.day,
    required this.total,
  });
}
