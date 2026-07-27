import 'package:dio/dio.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({required String baseUrl, Dio? dio})
      : _dio = dio ?? Dio(BaseOptions(baseUrl: baseUrl));

  final Dio _dio;

  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  Future<Map<String, dynamic>> get(String path) async {
    try {
      final response = await _dio.get(path);
      return Map<String, dynamic>.from(response.data as Map);
    } on DioException catch (e) {
      throw ApiException(e.message ?? 'Request failed', e.response?.statusCode);
    }
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Object? data,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return Map<String, dynamic>.from(response.data as Map);
    } on DioException catch (e) {
      throw ApiException(e.message ?? 'Request failed', e.response?.statusCode);
    }
  }
}
