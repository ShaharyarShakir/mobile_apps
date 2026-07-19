import 'dart:io';
import 'package:dart_frog/dart_frog.dart';
import '../exceptions/app_exception.dart';
import '../logger/logger.dart';
import 'context_types.dart';

Middleware errorHandlerMiddleware() {
  return (handler) {
    return (context) async {
      try {
        return await handler(context);
      } catch (e, stackTrace) {
        String? requestId;
        try {
          requestId = context.read<RequestId>().value;
        } catch (_) {
          // Request ID might not be in context
        }

        final path = context.request.uri.path;

        if (e is AppException) {
          StructuredLogger.warn(
            'AppException: ${e.message} (${e.code})',
            route: path,
            requestId: requestId,
          );
          return Response.json(
            statusCode: e.statusCode,
            body: e.toJson(),
          );
        }

        // Unhandled server errors (Internal Server Error)
        StructuredLogger.error(
          'Unhandled exception: $e',
          route: path,
          requestId: requestId,
          error: e,
          stackTrace: stackTrace,
        );

        return Response.json(
          statusCode: HttpStatus.internalServerError,
          body: {
            'success': false,
            'message': 'An unexpected error occurred.',
            'code': 'INTERNAL_SERVER_ERROR',
          },
        );
      }
    };
  };
}
