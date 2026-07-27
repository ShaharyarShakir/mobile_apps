import 'dart:async';
import 'dart:io';
import 'package:api/app/middleware/context_types.dart';
import 'package:api/features/expense/dto/expense_dto.dart';
import 'package:api/features/expense/service/expense_service.dart';
import 'package:dart_frog/dart_frog.dart';

FutureOr<Response> onRequest(RequestContext context) async {
  switch (context.request.method) {
    case HttpMethod.get:
      return _onGet(context);
    case HttpMethod.post:
      return _onPost(context);
    default:
      return Response(statusCode: HttpStatus.methodNotAllowed);
  }
}

Future<Response> _onGet(RequestContext context) async {
  final user = context.read<AuthenticatedUser>();
  final expenseService = context.read<ExpenseService>();

  final params = context.request.uri.queryParameters;
  final pageStr = params['page'];
  final pageSizeStr = params['pageSize'];
  final modifiedSinceStr = params['modifiedSince'];
  final includeDeletedStr = params['includeDeleted'];

  final page = pageStr != null ? int.tryParse(pageStr) : null;
  final pageSize = pageSizeStr != null ? int.tryParse(pageSizeStr) : null;
  final modifiedSince =
      modifiedSinceStr != null ? DateTime.tryParse(modifiedSinceStr) : null;
  final includeDeleted = includeDeletedStr == 'true';

  final expenses = await expenseService.getExpenses(
    user.id,
    page: page,
    pageSize: pageSize,
    modifiedSince: modifiedSince,
    includeDeleted: includeDeleted,
  );

  final jsonList = expenses
      .map(
        (e) => {
          'id': e.id,
          'userId': e.userId,
          'categoryId': e.categoryId,
          'amount': e.amount,
          'currency': e.currency,
          'note': e.note,
          'expenseDate': e.expenseDate.toIso8601String(),
          'receiptUrl': e.receiptUrl,
          'createdAt': e.createdAt.toIso8601String(),
          'updatedAt': e.updatedAt?.toIso8601String(),
          'deletedAt': e.deletedAt?.toIso8601String(),
        },
      )
      .toList();

  return Response.json(
    body: {
      'success': true,
      'data': jsonList,
    },
  );
}

Future<Response> _onPost(RequestContext context) async {
  final user = context.read<AuthenticatedUser>();
  final expenseService = context.read<ExpenseService>();

  final jsonBody = await context.request.json() as Map<String, dynamic>;
  final dto = CreateExpenseDto.fromJson(jsonBody);

  final expense = await expenseService.createExpense(user.id, dto);

  return Response.json(
    statusCode: HttpStatus.created,
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
