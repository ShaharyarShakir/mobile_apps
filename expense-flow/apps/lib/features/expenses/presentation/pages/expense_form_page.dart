import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:shared_models/shared_models.dart';
import 'package:mobile/core/utils/result.dart';
import 'package:mobile/shared/widgets/app_text_field.dart';
import 'package:mobile/shared/widgets/primary_button.dart';
import 'package:mobile/features/categories/presentation/providers/category_providers.dart';
import '../providers/expense_providers.dart';
import '../widgets/category_picker_sheet.dart';

class ExpenseFormPage extends ConsumerStatefulWidget {
  final String? expenseId;

  const ExpenseFormPage({this.expenseId, super.key});

  @override
  ConsumerState<ExpenseFormPage> createState() => _ExpenseFormPageState();
}

class _ExpenseFormPageState extends ConsumerState<ExpenseFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  
  String? _selectedCategoryId;
  Category? _selectedCategory;
  String _selectedCurrency = 'USD';
  DateTime _selectedDate = DateTime.now();
  String? _receiptUrl;
  bool _isInit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInit) {
      if (widget.expenseId != null) {
        _loadExistingExpense();
      }
      _isInit = true;
    }
  }

  Future<void> _loadExistingExpense() async {
    final result = await ref
        .read(expenseRepositoryProvider)
        .getExpenseById(widget.expenseId!);

    if (result is Success<Expense>) {
      final expense = result.data;
      setState(() {
        _amountController.text = expense.amount.toString();
        _noteController.text = expense.note ?? '';
        _selectedCategoryId = expense.categoryId;
        _selectedCategory = expense.category;
        _selectedCurrency = expense.currency;
        _selectedDate = expense.expenseDate;
        _receiptUrl = expense.receiptUrl;
      });
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _pickReceipt(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(source: source);
      if (pickedFile == null) return;

      final croppedFile = await ImageCropper().cropImage(
        sourcePath: pickedFile.path,
        uiSettings: [
          AndroidUiSettings(
            toolbarTitle: 'Crop Receipt',
            toolbarColor: Theme.of(context).colorScheme.primary,
            toolbarWidgetColor: Theme.of(context).colorScheme.onPrimary,
            initAspectRatio: CropAspectRatioPreset.original,
            lockAspectRatio: false,
            aspectRatioPresets: [
              CropAspectRatioPreset.original,
              CropAspectRatioPreset.square,
              CropAspectRatioPreset.ratio3x2,
              CropAspectRatioPreset.ratio4x3,
              CropAspectRatioPreset.ratio16x9,
            ],
          ),
          IOSUiSettings(
            title: 'Crop Receipt',
            aspectRatioPresets: [
              CropAspectRatioPreset.original,
              CropAspectRatioPreset.square,
              CropAspectRatioPreset.ratio3x2,
              CropAspectRatioPreset.ratio4x3,
              CropAspectRatioPreset.ratio16x9,
            ],
          ),
        ],
      );

      if (croppedFile != null) {
        final appDir = await getApplicationDocumentsDirectory();
        final extension = p.extension(croppedFile.path);
        final uniqueName = 'receipt_${DateTime.now().millisecondsSinceEpoch}$extension';
        final permanentFile = await File(croppedFile.path).copy(p.join(appDir.path, uniqueName));

        setState(() {
          _receiptUrl = permanentFile.path;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error picking receipt image: $e')),
        );
      }
    }
  }

  void _showImageSourcePicker() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Photo Gallery'),
              onTap: () {
                Navigator.of(context).pop();
                _pickReceipt(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_camera),
              title: const Text('Camera'),
              onTap: () {
                Navigator.of(context).pop();
                _pickReceipt(ImageSource.camera);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a category')),
      );
      return;
    }

    final amount = double.tryParse(_amountController.text) ?? 0.0;
    final note = _noteController.text.trim();

    final controller = ref.read(expenseControllerProvider.notifier);
    Result<Expense> result;

    if (widget.expenseId != null) {
      result = await controller.updateExpense(
        widget.expenseId!,
        categoryId: _selectedCategoryId,
        amount: amount,
        currency: _selectedCurrency,
        note: note,
        expenseDate: _selectedDate,
        receiptUrl: _receiptUrl,
      );
    } else {
      result = await controller.createExpense(
        categoryId: _selectedCategoryId!,
        amount: amount,
        currency: _selectedCurrency,
        note: note,
        expenseDate: _selectedDate,
        receiptUrl: _receiptUrl,
      );
    }

    if (mounted) {
      if (result is Failure<Expense>) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving: ${result.message}'),
            backgroundColor: Colors.red,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Expense saved successfully')),
        );
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(expenseControllerProvider).isLoading;
    final isEdit = widget.expenseId != null;

    final isLocalFile = _receiptUrl != null && !_receiptUrl!.startsWith('http');

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Expense' : 'Add Expense'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Dynamic Category selector widget
              InkWell(
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (context) => CategoryPickerSheet(
                      selectedCategory: _selectedCategory,
                      onCategorySelected: (cat) {
                        setState(() {
                          _selectedCategoryId = cat.id;
                          _selectedCategory = cat;
                        });
                      },
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(12),
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Category',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (_selectedCategory == null)
                        const Text('Select Category', style: TextStyle(fontSize: 16))
                      else
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 14,
                              backgroundColor: Color(_selectedCategory!.color).withOpacity(0.15),
                              child: Icon(
                                categoryIcons[_selectedCategory!.icon] ?? Icons.category,
                                color: Color(_selectedCategory!.color),
                                size: 16,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              _selectedCategory!.name,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      const Icon(Icons.arrow_drop_down),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              AppTextField(
                labelText: 'Amount',
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (val) {
                  if (val == null || val.isEmpty) return 'Amount is required';
                  final numVal = double.tryParse(val);
                  if (numVal == null || numVal <= 0) {
                    return 'Amount must be greater than 0';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedCurrency,
                decoration: InputDecoration(
                  labelText: 'Currency',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                items: const [
                  DropdownMenuItem(value: 'USD', child: Text('USD (\$)')),
                  DropdownMenuItem(value: 'EUR', child: Text('EUR (€)')),
                  DropdownMenuItem(value: 'GBP', child: Text('GBP (£)')),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedCurrency = val;
                    });
                  }
                },
              ),
              const SizedBox(height: 16),
              InkWell(
                onTap: () => _selectDate(context),
                borderRadius: BorderRadius.circular(12),
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Expense Date',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                        style: const TextStyle(fontSize: 16),
                      ),
                      const Icon(Icons.calendar_today),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              AppTextField(
                labelText: 'Note',
                controller: _noteController,
                validator: (val) {
                  if (val != null && val.length > 500) {
                    return 'Note cannot exceed 500 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              // Receipt Section
              const Text(
                'Receipt Attachment',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 12),
              if (_receiptUrl == null)
                InkWell(
                  onTap: _showImageSourcePicker,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    height: 120,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade400, style: BorderStyle.solid),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_a_photo_outlined, size: 36, color: Colors.grey),
                        SizedBox(height: 8),
                        Text('Add Receipt Photo', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ),
                )
              else
                Stack(
                  children: [
                    Container(
                      height: 200,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: isLocalFile
                          ? Image.file(
                              File(_receiptUrl!),
                              fit: BoxFit.cover,
                            )
                          : Image.network(
                              _receiptUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => const Center(
                                child: Icon(Icons.broken_image, size: 48, color: Colors.grey),
                              ),
                            ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: CircleAvatar(
                        backgroundColor: Colors.black.withOpacity(0.6),
                        child: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.white),
                          onPressed: () {
                            setState(() {
                              _receiptUrl = null;
                            });
                          },
                        ),
                      ),
                    ),
                    if (isLocalFile)
                      Positioned(
                        bottom: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.cloud_upload_outlined, color: Colors.orange, size: 16),
                              SizedBox(width: 6),
                              Text(
                                'Pending Sync',
                                style: TextStyle(color: Colors.white, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              const SizedBox(height: 32),
              PrimaryButton(
                text: isEdit ? 'Save Changes' : 'Create Expense',
                isLoading: isLoading,
                onPressed: _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
