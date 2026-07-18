import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      print('--> ${options.method} ${options.uri}');
      print('Headers: ${options.headers}');
      if (options.data != null) {
        print('Body: ${options.data}');
      }
    }
    return handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      print('<-- ${response.statusCode} ${response.requestOptions.uri}');
      if (response.data != null) {
        print('Response: ${response.data}');
      }
    }
    return handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      print('<-- ERROR ${err.message} for ${err.requestOptions.uri}');
      if (err.response != null) {
        print('Error Response: ${err.response?.data}');
      }
    }
    return handler.next(err);
  }
}
