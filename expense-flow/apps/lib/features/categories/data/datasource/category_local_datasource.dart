import 'package:drift/drift.dart';
import 'package:mobile/core/database/local_database.dart';

class CategoryLocalDataSource {
  final AppDatabase _database;

  CategoryLocalDataSource(this._database);

  Future<List<LocalCategory>> getAllCategories() async {
    final list = await (_database.select(_database.localCategories)).get();
    if (list.isEmpty) {
      await seedDefaultCategories();
      return (_database.select(_database.localCategories)).get();
    }
    return list;
  }

  Stream<List<LocalCategory>> watchAllCategories() {
    return _database.select(_database.localCategories).watch();
  }

  Future<LocalCategory?> getCategoryById(String id) async {
    return (_database.select(_database.localCategories)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
  }

  Future<void> saveCategories(List<LocalCategory> categories) async {
    await _database.batch((batch) {
      batch.insertAll(
        _database.localCategories,
        categories,
        mode: InsertMode.insertOrReplace,
      );
    });
  }

  Future<void> saveCategory(LocalCategory category) async {
    await _database.into(_database.localCategories).insertOnConflictUpdate(category);
  }

  Future<void> deleteCategory(String id) async {
    await (_database.delete(_database.localCategories)..where((t) => t.id.equals(id))).go();
  }

  Future<void> seedDefaultCategories() async {
    final defaults = [
      LocalCategory(id: 'food', userId: 'system', name: 'Food', icon: 'fastfood', color: 0xFFFF5252, syncStatus: 'synced'),
      LocalCategory(id: 'transport', userId: 'system', name: 'Transport', icon: 'directions_car', color: 0xFF448AFF, syncStatus: 'synced'),
      LocalCategory(id: 'bills', userId: 'system', name: 'Bills', icon: 'receipt_long', color: 0xFFFFAB40, syncStatus: 'synced'),
      LocalCategory(id: 'shopping', userId: 'system', name: 'Shopping', icon: 'shopping_bag', color: 0xFFE040FB, syncStatus: 'synced'),
      LocalCategory(id: 'health', userId: 'system', name: 'Health', icon: 'medical_services', color: 0xFF69F0AE, syncStatus: 'synced'),
      LocalCategory(id: 'entertainment', userId: 'system', name: 'Entertainment', icon: 'sports_esports', color: 0xFFFFD740, syncStatus: 'synced'),
      LocalCategory(id: 'education', userId: 'system', name: 'Education', icon: 'school', color: 0xFF00E676, syncStatus: 'synced'),
      LocalCategory(id: 'travel', userId: 'system', name: 'Travel', icon: 'flight', color: 0xFF00B0FF, syncStatus: 'synced'),
    ];
    await saveCategories(defaults);
  }

  Future<void> addToSyncQueue({
    required String entity,
    required String entityId,
    required String operation,
    required String payload,
  }) async {
    await _database.into(_database.syncQueue).insert(
          SyncQueueCompanion.insert(
            entity: entity,
            entityId: entityId,
            operation: operation,
            payload: payload,
          ),
        );
  }
}
