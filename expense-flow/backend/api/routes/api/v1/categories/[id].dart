import 'dart:async';
import 'dart:io';
import 'package:api/app/exceptions/app_exception.dart';
import 'package:api/app/middleware/context_types.dart';
import 'package:api/shared/models/models.dart';
import 'package:api/shared/repositories/repositories.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

FutureOr<Response> onRequest(RequestContext context, String id) async {
  switch (context.request.method) {
    case HttpMethod.patch:
      return _onPatch(context, id);
    case HttpMethod.delete:
      return _onDelete(context, id);
    default:
      return Response(statusCode: HttpStatus.methodNotAllowed);
  }
}

Future<Response> _onPatch(RequestContext context, String id) async {
  final user = context.read<AuthenticatedUser>();
  final categoryRepo = context.read<CategoryRepository>();

  final existing = await categoryRepo.getById(id);
  if (existing == null || existing.userId != user.id) {
    throw NotFoundException('Category not found.');
  }

  final jsonBody = await context.request.json() as Map<String, dynamic>;
  final name = jsonBody['name'] as String?;
  final icon = jsonBody['icon'] as String?;
  final color = jsonBody['color'] as int?;

  final category = Category(
    id: id,
    userId: user.id,
    name: name ?? existing.name,
    icon: icon ?? existing.icon,
    color: color ?? existing.color,
  );

  await categoryRepo.update(category);

  return Response.json(
    body: {
      'success': true,
      'data': {
        'id': id,
        'userId': user.id,
        'name': category.name,
        'icon': category.icon,
        'color': category.color,
      },
    },
  );
}

Future<Response> _onDelete(RequestContext context, String id) async {
  final user = context.read<AuthenticatedUser>();
  final categoryRepo = context.read<CategoryRepository>();
  final pool = context.read<Pool>();

  final existing = await categoryRepo.getById(id);
  if (existing == null || existing.userId != user.id) {
    throw NotFoundException('Category not found.');
  }

  // Check if any expenses reference this category
  final result = await pool.execute(
    Sql.named('SELECT COUNT(*) FROM expenses WHERE category_id = @categoryId AND deleted_at IS NULL'),
    parameters: {'categoryId': id},
  );
  final count = result.first.first as int;
  if (count > 0) {
    throw ValidationException('Cannot delete category because it is referenced by active expenses.');
  }

  await categoryRepo.delete(id);

  return Response.json(
    body: {
      'success': true,
      'message': 'Category deleted successfully.',
    },
  );
}
