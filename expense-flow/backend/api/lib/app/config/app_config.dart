import 'dart:io';

class AppConfig {
  AppConfig._();

  static final String apiUrl = Platform.environment['API_URL'] ?? 'http://localhost:8080';
  static final String environment = Platform.environment['ENV'] ?? 'development';
}

class DatabaseConfig {
  DatabaseConfig._();

  static final String host = Platform.environment['DATABASE_HOST'] ?? 'localhost';
  static final int port = int.tryParse(Platform.environment['DATABASE_PORT'] ?? '5432') ?? 5432;
  static final String databaseName = Platform.environment['DATABASE_NAME'] ?? 'expenseflow';
  static final String username = Platform.environment['DATABASE_USER'] ?? 'postgres';
  static final String password = Platform.environment['DATABASE_PASSWORD'] ?? 'postgres';
}

class JWTConfig {
  JWTConfig._();

  static final String secret = Platform.environment['JWT_SECRET'] ?? 'super-secret-key-change-in-production';
  static final int expiryMinutes = int.tryParse(Platform.environment['JWT_EXPIRY_MINUTES'] ?? '60') ?? 60;
}
