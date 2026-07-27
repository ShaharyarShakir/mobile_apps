import 'dart:async';
import 'dart:io';
import 'package:api/app/exceptions/app_exception.dart';
import 'package:api/app/middleware/context_types.dart';
import 'package:api/shared/models/models.dart';
import 'package:api/shared/repositories/repositories.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:uuid/uuid.dart';

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
  final categoryRepo = context.read<CategoryRepository>();

  final categories = await categoryRepo.getByUserId(user.id);

  final jsonList = categories
      .map(
        (c) => {
          'id': c.id,
          'userId': c.userId,
          'name': c.name,
          'icon': c.icon,
          'color': c.color,
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
  final categoryRepo = context.read<CategoryRepository>();

  final jsonBody = await context.request.json() as Map<String, dynamic>;
  final name = jsonBody['name'] as String?;
  final icon = jsonBody['icon'] as String?;
  final color = jsonBody['color'] as int?;

  if (name == null || name.isEmpty || icon == null || icon.isEmpty || color == null) {
    throw ValidationException('Name, icon, and color are required.');
  }

  final id = const Uuid().v4();
  final category = Category(
    id: id,
    userId: user.id,
    name: name,
    icon: icon,
    color: color,
  );

  await categoryRepo.create(category);

  return Response.json(
    statusCode: HttpStatus.created,
    body: {
      'success': true,
      'data': {
        'id': id,
        'userId': user.id,
        'name': name,
        'icon': icon,
        'color': color,
      },
    },
  );
}
