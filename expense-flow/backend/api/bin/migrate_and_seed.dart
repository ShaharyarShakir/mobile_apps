import 'dart:io';
import 'package:api/database/db_context.dart';
import 'package:api/database/migrate.dart';
import 'package:api/database/seeds/seeds.dart';

void main() async {
  final host = Platform.environment['DATABASE_HOST'] ?? 'localhost';
  final port = int.tryParse(Platform.environment['DATABASE_PORT'] ?? '5432') ?? 5432;
  print('Connecting to database on $host:$port...');
  
  final pool = DbContext.createPool();

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
