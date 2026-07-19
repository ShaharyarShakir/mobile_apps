import 'package:dart_frog/dart_frog.dart';
import '../exceptions/app_exception.dart';
import 'context_types.dart';

final _uuidRegex = RegExp(
  r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
);

Middleware authMiddleware() {
  return (handler) {
    return (context) async {
      final path = context.request.uri.path;
      if (path == '/health') {
        return handler(context);
      }

      final authHeader = context.request.headers['Authorization'] ??
          context.request.headers['authorization'];

      if (authHeader == null || !authHeader.startsWith('Bearer ')) {
        throw UnauthorizedException('Missing or invalid Authorization header.');
      }

      final token = authHeader.substring(7).trim();

      String userId;
      if (_uuidRegex.hasMatch(token)) {
        userId = token;
      } else if (token == 'mock-user-token' || token == 'test-token') {
        userId = '00000000-0000-0000-0000-000000000000'; // Default system user
      } else {
        throw UnauthorizedException('Invalid authorization token format.');
      }

      final response = await handler(
        context.provide<AuthenticatedUser>(() => AuthenticatedUser(userId)),
      );
      return response;
    };
  };
}
