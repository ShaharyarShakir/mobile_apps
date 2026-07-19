import 'package:dart_frog/dart_frog.dart';

Middleware helmetMiddleware() {
  return (handler) {
    return (context) async {
      final response = await handler(context);
      return response.copyWith(
        headers: {
          ...response.headers,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'no-referrer',
          'Content-Security-Policy': "default-src 'none'",
        },
      );
    };
  };
}
