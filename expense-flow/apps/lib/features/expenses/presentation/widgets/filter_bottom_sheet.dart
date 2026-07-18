import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/categories/presentation/providers/category_providers.dart';
import '../../domain/entity/expense_filter.dart';
import '../providers/expense_providers.dart';

class FilterBottomSheet extends ConsumerStatefulWidget {
  const FilterBottomSheet({super.key});

  @override
  ConsumerState<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends ConsumerState<FilterBottomSheet> {
  String? _selectedCategoryId;
  DateTimeRange? _selectedDateRange;
  double _minAmount = 0.0;
  double _maxAmount = 5000.0;
  SortOption _selectedSort = SortOption.newestFirst;
  String _activeDateChip = 'all';

  @override
  void initState() {
    super.initState();
    final currentFilter = ref.read(expenseFilterProvider);
    _selectedCategoryId = currentFilter.categoryId;
    _selectedDateRange = currentFilter.dateRange;
    _minAmount = currentFilter.minAmount ?? 0.0;
    _maxAmount = currentFilter.maxAmount ?? 5000.0;
    _selectedSort = currentFilter.sort;
  }

  void _setDateRangeFromChip(String chip) {
    setState(() {
      _activeDateChip = chip;
      final now = DateTime.now();
      switch (chip) {
        case 'today':
          final start = DateTime(now.year, now.month, now.day);
          _selectedDateRange = DateTimeRange(start: start, end: start);
          break;
        case 'week':
          final start = now.subtract(Duration(days: now.weekday - 1));
          final startOfDay = DateTime(start.year, start.month, start.day);
          _selectedDateRange = DateTimeRange(start: startOfDay, end: now);
          break;
        case 'month':
          final start = DateTime(now.year, now.month, 1);
          _selectedDateRange = DateTimeRange(start: start, end: now);
          break;
        case 'lastMonth':
          final start = DateTime(now.year, now.month - 1, 1);
          final end = DateTime(now.year, now.month, 0);
          _selectedDateRange = DateTimeRange(start: start, end: end);
          break;
        case 'custom':
          break;
        default:
          _selectedDateRange = null;
      }
    });
  }

  Future<void> _pickCustomDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      initialDateRange: _selectedDateRange,
    );
    if (picked != null) {
      setState(() {
        _selectedDateRange = picked;
        _activeDateChip = 'custom';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoryListProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Filters & Sort',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _selectedCategoryId = null;
                      _selectedDateRange = null;
                      _minAmount = 0.0;
                      _maxAmount = 5000.0;
                      _selectedSort = SortOption.newestFirst;
                      _activeDateChip = 'all';
                    });
                  },
                  child: const Text('Reset All'),
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Sort By', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<SortOption>(
                    value: _selectedSort,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: SortOption.newestFirst,
                        child: Text('Newest First'),
                      ),
                      DropdownMenuItem(
                        value: SortOption.oldestFirst,
                        child: Text('Oldest First'),
                      ),
                      DropdownMenuItem(
                        value: SortOption.highestAmount,
                        child: Text('Highest Amount'),
                      ),
                      DropdownMenuItem(
                        value: SortOption.lowestAmount,
                        child: Text('Lowest Amount'),
                      ),
                      DropdownMenuItem(
                        value: SortOption.categoryName,
                        child: Text('Category Name'),
                      ),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedSort = val);
                    },
                  ),
                  const SizedBox(height: 28),
                  const Text('Category', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  categoriesAsync.when(
                    data: (categories) => Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: categories.map((cat) {
                        final isSelected = _selectedCategoryId == cat.id;
                        final color = Color(cat.color);
                        return ChoiceChip(
                          label: Text(cat.name),
                          selected: isSelected,
                          selectedColor: color.withOpacity(0.2),
                          checkmarkColor: color,
                          labelStyle: TextStyle(
                            color: isSelected ? color : null,
                            fontWeight: isSelected ? FontWeight.bold : null,
                          ),
                          onSelected: (selected) {
                            setState(() {
                              _selectedCategoryId = selected ? cat.id : null;
                            });
                          },
                        );
                      }).toList(),
                    ),
                    loading: () => const LinearProgressIndicator(),
                    error: (_, __) => const Text('Error loading categories'),
                  ),
                  const SizedBox(height: 28),
                  const Text('Time Period', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildDateChip('all', 'All Time'),
                      _buildDateChip('today', 'Today'),
                      _buildDateChip('week', 'This Week'),
                      _buildDateChip('month', 'This Month'),
                      _buildDateChip('lastMonth', 'Last Month'),
                      ChoiceChip(
                        label: const Text('Custom...'),
                        selected: _activeDateChip == 'custom',
                        onSelected: (selected) {
                          if (selected) _pickCustomDateRange();
                        },
                      ),
                    ],
                  ),
                  if (_selectedDateRange != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      'Selected Range: ${_formatDate(_selectedDateRange!.start)} - ${_formatDate(_selectedDateRange!.end)}',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                  const SizedBox(height: 28),
                  const Text('Amount Range', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('\$${_minAmount.toStringAsFixed(0)}'),
                      Text('\$${_maxAmount.toStringAsFixed(0)}${_maxAmount >= 5000 ? '+' : ''}'),
                    ],
                  ),
                  RangeSlider(
                    values: RangeValues(_minAmount, _maxAmount),
                    min: 0.0,
                    max: 5000.0,
                    divisions: 50,
                    labels: RangeLabels(
                      '\$${_minAmount.toStringAsFixed(0)}',
                      '\$${_maxAmount.toStringAsFixed(0)}',
                    ),
                    onChanged: (values) {
                      setState(() {
                        _minAmount = values.start;
                        _maxAmount = values.end;
                      });
                    },
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  final newFilter = ExpenseFilter(
                    categoryId: _selectedCategoryId,
                    dateRange: _selectedDateRange,
                    minAmount: _minAmount == 0.0 ? null : _minAmount,
                    maxAmount: _maxAmount >= 5000.0 ? null : _maxAmount,
                    sort: _selectedSort,
                  );
                  ref.read(expenseFilterProvider.notifier).state = newFilter;
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Apply Filters', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateChip(String key, String label) {
    final isSelected = _activeDateChip == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) _setDateRangeFromChip(key);
      },
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
