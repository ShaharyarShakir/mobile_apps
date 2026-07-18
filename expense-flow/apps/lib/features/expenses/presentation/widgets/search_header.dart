import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/categories/presentation/providers/category_providers.dart';
import 'filter_bottom_sheet.dart';
import '../providers/expense_providers.dart';

class SearchHeader extends ConsumerStatefulWidget {
  const SearchHeader({super.key});

  @override
  ConsumerState<SearchHeader> createState() => _SearchHeaderState();
}

class _SearchHeaderState extends ConsumerState<SearchHeader> {
  final _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _searchController.text = ref.read(expenseSearchProvider);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      ref.read(expenseSearchProvider.notifier).state = query;
    });
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(expenseFilterProvider);
    final categories = ref.watch(categoryListProvider).value ?? [];

    final hasActiveFilters = filter.categoryId != null ||
        filter.dateRange != null ||
        filter.minAmount != null ||
        filter.maxAmount != null;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: SearchBar(
                  controller: _searchController,
                  hintText: 'Search note, category, amount...',
                  leading: const Icon(Icons.search),
                  trailing: [
                    if (_searchController.text.isNotEmpty)
                      IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _searchController.clear();
                          });
                          ref.read(expenseSearchProvider.notifier).state = '';
                        },
                      ),
                  ],
                  elevation: const WidgetStatePropertyAll(1.0),
                  onChanged: _onSearchChanged,
                ),
              ),
              const SizedBox(width: 12),
              Stack(
                children: [
                  IconButton.filledTonal(
                    onPressed: () {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (context) => const FilterBottomSheet(),
                      );
                    },
                    icon: const Icon(Icons.tune),
                  ),
                  if (hasActiveFilters)
                    Positioned(
                      top: 4,
                      right: 4,
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
          if (hasActiveFilters) ...[
            const SizedBox(height: 12),
            SizedBox(
              height: 36,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  if (filter.categoryId != null) ...[
                    (() {
                      final matches = categories.where((c) => c.id == filter.categoryId);
                      if (matches.isNotEmpty) {
                        return _buildFilterChip(
                          label: 'Category: ${matches.first.name}',
                          onDeleted: () {
                            ref.read(expenseFilterProvider.notifier).state =
                                filter.copyWith(clearCategory: true);
                          },
                        );
                      }
                      return const SizedBox.shrink();
                    })(),
                  ],
                  if (filter.dateRange != null)
                    _buildFilterChip(
                      label: 'Date Range Active',
                      onDeleted: () {
                        ref.read(expenseFilterProvider.notifier).state =
                            filter.copyWith(clearDateRange: true);
                      },
                    ),
                  if (filter.minAmount != null || filter.maxAmount != null)
                    _buildFilterChip(
                      label: 'Amount Limits Active',
                      onDeleted: () {
                        ref.read(expenseFilterProvider.notifier).state =
                            filter.copyWith(minAmount: 0.0, maxAmount: 5000.0);
                      },
                    ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFilterChip({required String label, required VoidCallback onDeleted}) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      child: InputChip(
        label: Text(label, style: const TextStyle(fontSize: 12)),
        onDeleted: onDeleted,
        deleteIconColor: Colors.grey,
      ),
    );
  }
}
