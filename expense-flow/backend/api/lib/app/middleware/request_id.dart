import 'package:dart_frog/dart_frog.dart';
import 'package:uuid/uuid.dart';
import 'context_types.dart';

const _uuid = Uuid();

Middleware requestIdMiddleware() {
  return (handler) {
    return (context) async {
      final incomingId = context.request.headers['x-request-id'] ??
          context.request.headers['X-Request-ID'];
      final requestId = incomingId ?? _uuid.v4();

      final response = await handler(
        context.provide<RequestId>(() => RequestId(requestId)),
      );
      return response.copyWith(
        headers: {
          ...response.headers,
          'X-Request-ID': requestId,
        },
      );
    };
  };
}
