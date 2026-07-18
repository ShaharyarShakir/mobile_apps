import 'dart:io';
import 'package:api/app/database/connection.dart';
import 'package:api/app/database/migration.dart';
import 'package:api/app/database/seed.dart';

void main() async {
  final host = Platform.environment['DATABASE_HOST'] ?? 'localhost';
  final port = int.tryParse(Platform.environment['DATABASE_PORT'] ?? '5432') ?? 5432;
  print('Connecting to database on $host:$port...');

  final pool = DatabaseConnection.createPool();

  try {
    print('Running migrations...');
    await runMigrations(pool);

    print('Seeding database...');
    await seedDatabase(pool);

    print('Database setup completed successfully.');
  } catch (e, stackTrace) {
    print('Failed to setup database: $e');
    print(stackTrace);
  } finally {
    await pool.close();
  }
}
