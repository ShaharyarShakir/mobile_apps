import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_models/shared_models.dart';
import 'package:mobile/shared/widgets/currency_text.dart';
import 'package:mobile/shared/widgets/error_view.dart';
import 'package:mobile/shared/widgets/loading_indicator.dart';
import 'package:mobile/core/utils/result.dart';
import '../providers/expense_providers.dart';
import '../widgets/search_header.dart';
import '../widgets/category_picker_sheet.dart' show categoryIcons;

import 'package:mobile/core/services/connectivity_service.dart';
import 'package:mobile/core/services/sync_service.dart';

class ExpensesPage extends ConsumerWidget {
  const ExpensesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final expensesAsync = ref.watch(flattenedGroupedExpensesProvider);
    final isOnline = ref.watch(connectivityServiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Expenses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () {
              ref.read(syncServiceProvider.notifier).sync();
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              context.push('/sync-settings');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          if (!isOnline)
            Container(
              width: double.infinity,
              color: Colors.grey.shade800,
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.cloud_off, color: Colors.white, size: 16),
                  SizedBox(width: 8),
                  Text(
                    'Offline Mode - Changes will sync when online',
                    style: TextStyle(color: Colors.white, fontSize: 13),
                  ),
                ],
              ),
            ),
          const SearchHeader(),
          Expanded(
            child: expensesAsync.when(
              data: (items) {
                if (items.isEmpty) {
                  final searchActive = ref.read(expenseSearchProvider).isNotEmpty;
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          searchActive ? Icons.search_off : Icons.account_balance_wallet_outlined,
                          size: 64,
                          color: Theme.of(context).colorScheme.outline,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          searchActive
                              ? 'No results matching your query.'
                              : 'No expenses recorded yet.',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: Theme.of(context).colorScheme.outline,
                              ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => ref.read(syncServiceProvider.notifier).sync(),
                  child: ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      if (item.header != null) {
                        return Padding(
                          padding: const EdgeInsets.only(
                            left: 16,
                            right: 16,
                            top: 24,
                            bottom: 8,
                          ),
                          child: Text(
                            item.header!,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        );
                      }
                      return _ExpenseCard(expense: item.expense!);
                    },
                  ),
                );
              },
              loading: () => const LoadingIndicator(message: 'Loading expenses...'),
              error: (err, stack) => ErrorView(
                message: 'Error: $err',
                onRetry: () => ref.read(syncServiceProvider.notifier).sync(),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/expenses/form'),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class SyncStatusIndicator extends ConsumerWidget {
  final String? status;

  const SyncStatusIndicator({this.status, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(connectivityServiceProvider);

    if (status == 'synced') {
      return const Icon(
        Icons.cloud_done,
        color: Colors.green,
        size: 16,
      );
    }
    if (status == 'syncing') {
      return const SizedBox(
        width: 12,
        height: 12,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(Colors.orange),
        ),
      );
    }
    if (status == 'failed') {
      return const Icon(
        Icons.error_outline,
        color: Colors.red,
        size: 16,
      );
    }
    if (!isOnline) {
      return const Icon(
        Icons.cloud_off,
        color: Colors.grey,
        size: 16,
      );
    }
    return const Icon(
      Icons.sync,
      color: Colors.orange,
      size: 16,
    );
  }
}

class _ExpenseCard extends ConsumerWidget {
  final Expense expense;

  const _ExpenseCard({required this.expense});

  IconData _getCategoryIcon(Category? category) {
    if (category == null) return Icons.payments;
    return categoryIcons[category.icon] ?? Icons.category;
  }

  Color _getCategoryColor(Category? category) {
    if (category == null) return Colors.teal;
    return Color(category.color);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoryName = expense.category?.name ?? 'General';
    final dateStr =
        '${expense.expenseDate.day} ${_getMonthName(expense.expenseDate.month)} ${expense.expenseDate.year}';

    return Slidable(
      key: ValueKey(expense.id),
      endActionPane: ActionPane(
        motion: const DrawerMotion(),
        children: [
          SlidableAction(
            onPressed: (context) {
              context.push('/expenses/form?id=${expense.id}');
            },
            backgroundColor: Colors.blue.shade600,
            foregroundColor: Colors.white,
            icon: Icons.edit,
            label: 'Edit',
          ),
          SlidableAction(
            onPressed: (context) => _showDeleteDialog(context, ref),
            backgroundColor: Colors.red.shade600,
            foregroundColor: Colors.white,
            icon: Icons.delete,
            label: 'Delete',
          ),
        ],
      ),
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: ListTile(
          onTap: () => context.push('/expenses/form?id=${expense.id}'),
          leading: CircleAvatar(
            backgroundColor: _getCategoryColor(expense.category).withOpacity(0.15),
            child: Icon(
              _getCategoryIcon(expense.category),
              color: _getCategoryColor(expense.category),
            ),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                categoryName,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              CurrencyText(
                amount: expense.amount,
                symbol: expense.currency == 'USD' ? '\$' : '${expense.currency} ',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          subtitle: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  expense.note ?? 'No details',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SyncStatusIndicator(status: expense.syncStatus),
                  const SizedBox(width: 6),
                  Text(
                    dateStr,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.outline,
                        ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getMonthName(int month) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return months[month - 1];
  }

  void _showDeleteDialog(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Expense?'),
        content: const Text('Are you sure you want to delete this expense?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final result = await ref
                  .read(expenseControllerProvider.notifier)
                  .deleteExpense(expense.id);

              if (context.mounted) {
                if (result is Failure<void>) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to delete: ${result.message}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Expense deleted')),
                  );
                }
              }
            },
            child: const Text(
              'Delete',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}
