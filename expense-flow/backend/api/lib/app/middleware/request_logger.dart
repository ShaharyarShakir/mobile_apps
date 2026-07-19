import 'package:dart_frog/dart_frog.dart';
import '../logger/logger.dart';
import 'context_types.dart';

Middleware requestLoggerMiddleware() {
  return (handler) {
    return (context) async {
      final stopwatch = Stopwatch()..start();
      final request = context.request;
      final path = request.uri.path;
      final method = request.method.value;

      String? requestId;
      try {
        requestId = context.read<RequestId>().value;
      } catch (_) {
        // Request ID might not be provided in context yet
      }

      StructuredLogger.info(
        'Incoming request: $method $path',
        route: path,
        requestId: requestId,
      );

      final response = await handler(context);

      stopwatch.stop();
      final durationMs = stopwatch.elapsedMilliseconds;
      final status = response.statusCode;

      StructuredLogger.info(
        'Completed request: $method $path -> $status in ${durationMs}ms',
        route: path,
        requestId: requestId,
      );

      return response;
    };
  };
}
