import 'package:shared_models/shared_models.dart';
import '../client/api_client.dart';

class AuthApi {
  AuthApi(this._client);

  final ApiClient _client;

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final json = await _client.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    return AuthResponse.fromJson(json);
  }
}
