import 'package:postgres/postgres.dart';

Future<void> seedDatabase(SessionExecutor executor) async {
  await executor.run((session) async {
    // Create a default system user if not exists
    final systemUserId = '00000000-0000-0000-0000-000000000000';

    await session.execute(
      Sql.named(
        'INSERT INTO users (id, name, email, password_hash, created_at) '
        'VALUES (@id, @name, @email, @password_hash, @created_at) '
        'ON CONFLICT (id) DO NOTHING;',
      ),
      parameters: {
        'id': systemUserId,
        'name': 'System',
        'email': 'system@expenseflow.com',
        'password_hash': 'system-placeholder-hash',
        'created_at': DateTime.now(),
      },
    );

    final defaultCategories = [
      {'name': 'Food', 'icon': 'fastfood', 'color': 0xFFE57373.toSigned(32)},
      {'name': 'Transport', 'icon': 'directions_car', 'color': 0xFF64B5F6.toSigned(32)},
      {'name': 'Bills', 'icon': 'receipt_long', 'color': 0xFFFFB74D.toSigned(32)},
      {'name': 'Shopping', 'icon': 'shopping_bag', 'color': 0xFFBA68C8.toSigned(32)},
      {'name': 'Health', 'icon': 'medical_services', 'color': 0xFF81C784.toSigned(32)},
      {'name': 'Entertainment', 'icon': 'sports_esports', 'color': 0xFFFFD54F.toSigned(32)},
    ];

    for (final cat in defaultCategories) {
      final name = cat['name'] as String;
      final results = await session.execute(
        Sql.named('SELECT id FROM categories WHERE user_id = @userId AND name = @name;'),
        parameters: {
          'userId': systemUserId,
          'name': name,
        },
      );

      if (results.isEmpty) {
        final fixedId = _getCategoryUuid(name);
        await session.execute(
          Sql.named(
            'INSERT INTO categories (id, user_id, name, icon, color) '
            'VALUES (@id, @userId, @name, @icon, @color);',
          ),
          parameters: {
            'id': fixedId,
            'userId': systemUserId,
            'name': name,
            'icon': cat['icon'],
            'color': cat['color'],
          },
        );
        print('Seeded category: $name');
      }
    }
  });
}

String _getCategoryUuid(String name) {
  switch (name) {
    case 'Food': return '11111111-1111-1111-1111-111111111111';
    case 'Transport': return '22222222-2222-2222-2222-222222222222';
    case 'Bills': return '33333333-3333-3333-3333-333333333333';
    case 'Shopping': return '44444444-4444-4444-4444-444444444444';
    case 'Health': return '55555555-5555-5555-5555-555555555555';
    case 'Entertainment': return '66666666-6666-6666-6666-666666666666';
    default: return '99999999-9999-9999-9999-999999999999';
  }
}
