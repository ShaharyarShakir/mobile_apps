import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_models/shared_models.dart';
import 'package:mobile/features/categories/presentation/providers/category_providers.dart';
import 'package:mobile/core/utils/result.dart';

const Map<String, IconData> categoryIcons = {
  'fastfood': Icons.fastfood,
  'directions_car': Icons.directions_car,
  'receipt_long': Icons.receipt_long,
  'shopping_bag': Icons.shopping_bag,
  'medical_services': Icons.medical_services,
  'sports_esports': Icons.sports_esports,
  'school': Icons.school,
  'flight': Icons.flight,
  'coffee': Icons.coffee,
  'restaurant': Icons.restaurant,
  'local_grocery_store': Icons.local_grocery_store,
  'movie': Icons.movie,
  'fitness_center': Icons.fitness_center,
  'home': Icons.home,
  'work': Icons.work,
  'pets': Icons.pets,
  'phone': Icons.phone,
  'computer': Icons.computer,
};

const List<Color> categoryColors = [
  Colors.red,
  Colors.pink,
  Colors.purple,
  Colors.deepPurple,
  Colors.indigo,
  Colors.blue,
  Colors.lightBlue,
  Colors.cyan,
  Colors.teal,
  Colors.green,
  Colors.lightGreen,
  Colors.lime,
  Colors.yellow,
  Colors.amber,
  Colors.orange,
  Colors.deepOrange,
  Colors.brown,
  Colors.blueGrey,
];

class CategoryPickerSheet extends ConsumerStatefulWidget {
  final Category? selectedCategory;
  final ValueChanged<Category> onCategorySelected;

  const CategoryPickerSheet({
    required this.onCategorySelected,
    this.selectedCategory,
    super.key,
  });

  @override
  ConsumerState<CategoryPickerSheet> createState() => _CategoryPickerSheetState();
}

class _CategoryPickerSheetState extends ConsumerState<CategoryPickerSheet> {
  bool _isCreatingCustom = false;
  String _customName = '';
  String _customIconKey = 'fastfood';
  Color _customColor = Colors.blue;
  String _iconSearchQuery = '';

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoryListProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag handle
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
          // Title / Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _isCreatingCustom ? 'Create Custom Category' : 'Select Category',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                if (!_isCreatingCustom)
                  TextButton.icon(
                    onPressed: () => setState(() => _isCreatingCustom = true),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Custom'),
                  )
                else
                  TextButton(
                    onPressed: () => setState(() => _isCreatingCustom = false),
                    child: const Text('Cancel'),
                  ),
              ],
            ),
          ),
          const Divider(),
          // Content
          Expanded(
            child: _isCreatingCustom ? _buildCustomCreator() : _buildCategoryGrid(categoriesAsync),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryGrid(AsyncValue<List<Category>> categoriesAsync) {
    return categoriesAsync.when(
      data: (categories) {
        return GridView.builder(
          padding: const EdgeInsets.all(24),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 0.85,
          ),
          itemCount: categories.length,
          itemBuilder: (context, index) {
            final category = categories[index];
            final color = Color(category.color);
            final isSelected = widget.selectedCategory?.id == category.id;

            return InkWell(
              onTap: () {
                widget.onCategorySelected(category);
                Navigator.of(context).pop();
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                decoration: BoxDecoration(
                  color: isSelected ? color.withOpacity(0.12) : null,
                  borderRadius: BorderRadius.circular(16),
                  border: isSelected ? Border.all(color: color, width: 2) : null,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      backgroundColor: color.withOpacity(0.15),
                      child: Icon(
                        categoryIcons[category.icon] ?? Icons.category,
                        color: color,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      category.name,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: isSelected ? FontWeight.bold : null,
                          ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, __) => Center(child: Text('Error loading categories: $e')),
    );
  }

  Widget _buildCustomCreator() {
    final filteredIcons = categoryIcons.keys
        .where((key) => key.toLowerCase().contains(_iconSearchQuery.toLowerCase()))
        .toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Live Preview Badge
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: _customColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: _customColor, width: 1.5),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(categoryIcons[_customIconKey] ?? Icons.category, color: _customColor),
                  const SizedBox(width: 12),
                  Text(
                    _customName.isEmpty ? 'Preview Category' : _customName,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: _customColor,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          // Name Input
          TextField(
            decoration: const InputDecoration(
              labelText: 'Category Name',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.edit),
            ),
            maxLength: 20,
            onChanged: (val) => setState(() => _customName = val),
          ),
          const SizedBox(height: 24),
          // Color Select
          const Text('Select Theme Color', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: categoryColors.length,
              itemBuilder: (context, index) {
                final color = categoryColors[index];
                final isSelected = _customColor == color;
                return GestureDetector(
                  onTap: () => setState(() => _customColor = color),
                  child: Container(
                    margin: const EdgeInsets.only(right: 12),
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: isSelected
                          ? Border.all(color: Colors.white, width: 3)
                          : null,
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: color.withOpacity(0.4),
                                blurRadius: 8,
                                spreadRadius: 2,
                              )
                            ]
                          : null,
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 32),
          // Search Icon
          const Text('Select Icon', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          TextField(
            decoration: const InputDecoration(
              labelText: 'Search Icons',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.search),
              isDense: true,
            ),
            onChanged: (val) => setState(() => _iconSearchQuery = val),
          ),
          const SizedBox(height: 16),
          // Icons Grid
          SizedBox(
            height: 180,
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 6,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
              ),
              itemCount: filteredIcons.length,
              itemBuilder: (context, index) {
                final iconKey = filteredIcons[index];
                final icon = categoryIcons[iconKey]!;
                final isSelected = _customIconKey == iconKey;

                return InkWell(
                  onTap: () => setState(() => _customIconKey = iconKey),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: isSelected ? _customColor.withOpacity(0.15) : null,
                      borderRadius: BorderRadius.circular(12),
                      border: isSelected
                          ? Border.all(color: _customColor, width: 2)
                          : Border.all(color: Colors.grey.shade300, width: 1),
                    ),
                    child: Icon(icon, color: isSelected ? _customColor : Colors.grey.shade600),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 40),
          // Save Button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _customName.trim().isEmpty
                  ? null
                  : () async {
                      final result = await ref
                          .read(categoryControllerProvider.notifier)
                          .createCategory(
                            name: _customName,
                            icon: _customIconKey,
                            color: _customColor.value,
                          );
                      if (result is Success<Category>) {
                        setState(() => _isCreatingCustom = false);
                        widget.onCategorySelected(result.data);
                        Navigator.of(context).pop();
                      }
                    },
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Save Category', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
