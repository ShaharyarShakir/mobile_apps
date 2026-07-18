import 'dart:convert';

class StructuredLogger {
  static void _log(
    String level,
    String message, {
    String? route,
    String? userId,
    String? requestId,
    Object? error,
    StackTrace? stackTrace,
  }) {
    final payload = <String, dynamic>{
      'time': DateTime.now().toUtc().toIso8601String(),
      'level': level,
      'message': message,
    };

    if (route != null) payload['route'] = route;
    if (userId != null) payload['userId'] = userId;
    if (requestId != null) payload['requestId'] = requestId;
    if (error != null) payload['error'] = error.toString();
    if (stackTrace != null) payload['stackTrace'] = stackTrace.toString();

    print(jsonEncode(payload));
  }

  static void info(String message, {String? route, String? userId, String? requestId}) {
    _log('INFO', message, route: route, userId: userId, requestId: requestId);
  }

  static void warn(String message, {String? route, String? userId, String? requestId}) {
    _log('WARN', message, route: route, userId: userId, requestId: requestId);
  }

  static void error(
    String message, {
    String? route,
    String? userId,
    String? requestId,
    Object? error,
    StackTrace? stackTrace,
  }) {
    _log(
      'ERROR',
      message,
      route: route,
      userId: userId,
      requestId: requestId,
      error: error,
      stackTrace: stackTrace,
    );
  }

  static void debug(String message, {String? route, String? userId, String? requestId}) {
    _log('DEBUG', message, route: route, userId: userId, requestId: requestId);
  }
}
