import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

class AuthInterceptor extends Interceptor {
  final SecureStorageService _secureStorage;
  final Dio _refreshDio;

  AuthInterceptor(this._secureStorage, this._refreshDio);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _secureStorage.readAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await _secureStorage.readRefreshToken();
      if (refreshToken != null) {
        try {
          final response = await _refreshDio.post<Map<String, dynamic>>(
            '/api/v1/auth/refresh',
            data: {'refreshToken': refreshToken},
          );

          final newAccessToken = response.data?['accessToken'] as String?;
          final newRefreshToken = response.data?['refreshToken'] as String?;

          if (newAccessToken != null && newRefreshToken != null) {
            await _secureStorage.writeAccessToken(newAccessToken);
            await _secureStorage.writeRefreshToken(newRefreshToken);

            final options = err.requestOptions;
            options.headers['Authorization'] = 'Bearer $newAccessToken';

            final retryDio = Dio(
              BaseOptions(
                baseUrl: options.baseUrl,
                headers: options.headers,
              ),
            );

            final clonedResponse = await retryDio.request<dynamic>(
              options.path,
              data: options.data,
              queryParameters: options.queryParameters,
              options: Options(
                method: options.method,
                headers: options.headers,
              ),
            );

            return handler.resolve(clonedResponse);
          }
        } catch (e) {
          await _secureStorage.clearAll();
        }
      }
    }
    return handler.next(err);
  }
}
