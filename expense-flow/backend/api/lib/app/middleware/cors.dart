import 'package:dart_frog/dart_frog.dart';

Middleware corsMiddleware() {
  return (handler) {
    return (context) async {
      // Handle preflight OPTIONS requests
      if (context.request.method == HttpMethod.options) {
        return Response(
          statusCode: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers':
                'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID',
            'Access-Control-Max-Age': '86400',
          },
        );
      }

      final response = await handler(context);
      return response.copyWith(
        headers: {
          ...response.headers,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers':
              'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID',
        },
      );
    };
  };
}
