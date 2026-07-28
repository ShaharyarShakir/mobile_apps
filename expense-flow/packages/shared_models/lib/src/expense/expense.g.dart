// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'expense.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Expense _$ExpenseFromJson(Map<String, dynamic> json) => _Expense(
  id: json['id'] as String,
  userId: json['userId'] as String,
  categoryId: json['categoryId'] as String?,
  amount: (json['amount'] as num).toDouble(),
  currency: json['currency'] as String,
  expenseDate: DateTime.parse(json['expenseDate'] as String),
  note: json['note'] as String?,
  category: json['category'] == null
      ? null
      : Category.fromJson(json['category'] as Map<String, dynamic>),
  receiptUrl: json['receiptUrl'] as String?,
  syncStatus: json['syncStatus'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  deletedAt: json['deletedAt'] == null
      ? null
      : DateTime.parse(json['deletedAt'] as String),
);

Map<String, dynamic> _$ExpenseToJson(_Expense instance) => <String, dynamic>{
  'id': instance.id,
  'userId': instance.userId,
  'categoryId': instance.categoryId,
  'amount': instance.amount,
  'currency': instance.currency,
  'expenseDate': instance.expenseDate.toIso8601String(),
  'note': instance.note,
  'category': instance.category,
  'receiptUrl': instance.receiptUrl,
  'syncStatus': instance.syncStatus,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  'deletedAt': instance.deletedAt?.toIso8601String(),
};
