import 'package:dart_frog/dart_frog.dart';

Middleware rateLimiterMiddleware() {
  return (handler) {
    return (context) async {
      // Placeholder rate limiter check.
      // In production, we would query Redis or an in-memory cache here.
      return handler(context);
    };
  };
}
