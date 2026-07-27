import 'dart:async';
import 'dart:io';
import 'package:api/app/middleware/context_types.dart';
import 'package:api/features/expense/dto/expense_dto.dart';
import 'package:api/features/expense/service/expense_service.dart';
import 'package:dart_frog/dart_frog.dart';

FutureOr<Response> onRequest(RequestContext context, String id) async {
  switch (context.request.method) {
    case HttpMethod.get:
      return _onGet(context, id);
    case HttpMethod.patch:
      return _onPatch(context, id);
    case HttpMethod.delete:
      return _onDelete(context, id);
    default:
      return Response(statusCode: HttpStatus.methodNotAllowed);
  }
}

Future<Response> _onGet(RequestContext context, String id) async {
  final user = context.read<AuthenticatedUser>();
  final expenseService = context.read<ExpenseService>();

  final expense = await expenseService.getExpenseById(user.id, id);

  return Response.json(
    body: {
      'success': true,
      'data': {
        'id': expense.id,
        'userId': expense.userId,
        'categoryId': expense.categoryId,
        'amount': expense.amount,
        'currency': expense.currency,
        'note': expense.note,
        'expenseDate': expense.expenseDate.toIso8601String(),
        'receiptUrl': expense.receiptUrl,
        'createdAt': expense.createdAt.toIso8601String(),
        'updatedAt': expense.updatedAt?.toIso8601String(),
        'deletedAt': expense.deletedAt?.toIso8601String(),
      },
    },
  );
}

Future<Response> _onPatch(RequestContext context, String id) async {
  final user = context.read<AuthenticatedUser>();
  final expenseService = context.read<ExpenseService>();

  final jsonBody = await context.request.json() as Map<String, dynamic>;
  final dto = UpdateExpenseDto.fromJson(jsonBody);

  final expense = await expenseService.updateExpense(user.id, id, dto);

  return Response.json(
    body: {
      'success': true,
      'data': {
        'id': expense.id,
        'userId': expense.userId,
        'categoryId': expense.categoryId,
        'amount': expense.amount,
        'currency': expense.currency,
        'note': expense.note,
        'expenseDate': expense.expenseDate.toIso8601String(),
        'receiptUrl': expense.receiptUrl,
        'createdAt': expense.createdAt.toIso8601String(),
        'updatedAt': expense.updatedAt?.toIso8601String(),
        'deletedAt': expense.deletedAt?.toIso8601String(),
      },
    },
  );
}

Future<Response> _onDelete(RequestContext context, String id) async {
  final user = context.read<AuthenticatedUser>();
  final expenseService = context.read<ExpenseService>();

  await expenseService.deleteExpense(user.id, id);

  return Response.json(
    body: {
      'success': true,
      'message': 'Expense deleted successfully.',
    },
  );
}
