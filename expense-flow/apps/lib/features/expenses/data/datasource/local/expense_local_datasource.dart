import 'package:drift/drift.dart';
import 'package:mobile/core/database/local_database.dart';

class ExpenseLocalDataSource {
  final AppDatabase _database;

  ExpenseLocalDataSource(this._database);

  Stream<List<LocalExpense>> watchAllExpenses() {
    return (_database.select(_database.localExpenses)
          ..where((t) => t.deletedAt.isNull())
          ..orderBy([
            (t) => OrderingTerm(expression: t.expenseDate, mode: OrderingMode.desc)
          ]))
        .watch();
  }

  Future<List<LocalExpense>> getAllExpenses() async {
    return (_database.select(_database.localExpenses)
          ..where((t) => t.deletedAt.isNull())
          ..orderBy([
            (t) => OrderingTerm(expression: t.expenseDate, mode: OrderingMode.desc)
          ]))
        .get();
  }

  Future<LocalExpense?> getExpenseById(String id) async {
    return (_database.select(_database.localExpenses)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
  }

  Future<void> saveExpenses(List<LocalExpense> expenses) async {
    await _database.batch((batch) {
      batch.insertAll(
        _database.localExpenses,
        expenses,
        mode: InsertMode.insertOrReplace,
      );
    });
  }

  Future<void> saveExpense(LocalExpense expense) async {
    await _database.into(_database.localExpenses).insertOnConflictUpdate(expense);
  }

  Future<void> deleteExpense(String id) async {
    await (_database.update(_database.localExpenses)..where((t) => t.id.equals(id))).write(
      LocalExpensesCompanion(
        deletedAt: Value(DateTime.now()),
      ),
    );
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
