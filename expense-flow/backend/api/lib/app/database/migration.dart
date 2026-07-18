import 'dart:io';
import 'package:postgres/postgres.dart';

Future<void> runMigrations(SessionExecutor executor) async {
  await executor.run((session) async {
    // 1. Create tracking table
    await session.execute(
      'CREATE TABLE IF NOT EXISTS _migrations ('
      '  id VARCHAR(255) PRIMARY KEY,'
      '  run_at TIMESTAMP DEFAULT NOW()'
      ');',
    );

    // 2. Fetch already executed migrations
    final results = await session.execute('SELECT id FROM _migrations;');
    final runMigrationIds = results.map((row) => row[0] as String).toSet();

    // 3. Define migrations in order
    final migrationFiles = [
      '001_initial.sql',
      '002_categories.sql',
      '003_indexes.sql',
      '004_expense_updates.sql',
      '005_uuid_to_varchar.sql',
    ];

    final migrationsDir = Directory('lib/app/database/migrations');
    if (!migrationsDir.existsSync()) {
      throw Exception('Migrations directory not found: ${migrationsDir.path}');
    }

    for (final filename in migrationFiles) {
      if (runMigrationIds.contains(filename)) {
        print('Migration $filename is already applied.');
        continue;
      }

      final file = File('${migrationsDir.path}/$filename');
      if (!file.existsSync()) {
        throw Exception('Migration file not found: ${file.path}');
      }

      print('Applying migration $filename...');
      final sql = await file.readAsString();

      // Split statements by semicolon and run them one by one.
      final statements = sql
          .split(';')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();

      for (final stmt in statements) {
        await session.execute(stmt);
      }

      // Record that this migration was run
      await session.execute(
        Sql.named('INSERT INTO _migrations (id) VALUES (@id);'),
        parameters: {'id': filename},
      );

      print('Migration $filename applied successfully.');
    }
  });
}
