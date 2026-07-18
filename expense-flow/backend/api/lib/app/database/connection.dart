import 'dart:io';
import 'package:postgres/postgres.dart';

class DatabaseConnection {
  static Pool createPool() {
    final host = Platform.environment['DATABASE_HOST'] ?? 'localhost';
    final port = int.tryParse(Platform.environment['DATABASE_PORT'] ?? '5432') ?? 5432;
    final databaseName = Platform.environment['DATABASE_NAME'] ?? 'expenseflow';
    final username = Platform.environment['DATABASE_USER'] ?? 'postgres';
    final password = Platform.environment['DATABASE_PASSWORD'] ?? 'postgres';

    return Pool.withEndpoints(
      [
        Endpoint(
          host: host,
          port: port,
          database: databaseName,
          username: username,
          password: password,
        ),
      ],
      settings: const PoolSettings(
        maxConnectionCount: 10,
        sslMode: SslMode.disable,
      ),
    );
  }
}
