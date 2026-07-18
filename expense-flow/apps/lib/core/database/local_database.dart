import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'local_database.g.dart';

class LocalUsers extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get email => text()();
  TextColumn get passwordHash => text()();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

class LocalCategories extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text()();
  TextColumn get name => text()();
  TextColumn get icon => text()();
  IntColumn get color => integer()();
  TextColumn get syncStatus => text().withDefault(const Constant('synced'))();

  @override
  Set<Column> get primaryKey => {id};
}

class LocalExpenses extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text()();
  TextColumn get categoryId => text().nullable()();
  RealColumn get amount => real()();
  TextColumn get currency => text().withDefault(const Constant('USD'))();
  TextColumn get note => text().nullable()();
  DateTimeColumn get expenseDate => dateTime()();
  TextColumn get receiptUrl => text().nullable()();
  TextColumn get syncStatus => text().withDefault(const Constant('synced'))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
  DateTimeColumn get deletedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class LocalIncomes extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text()();
  RealColumn get amount => real()();
  TextColumn get source => text()();
  DateTimeColumn get incomeDate => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

class LocalBudgets extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text()();
  TextColumn get categoryId => text().nullable()();
  RealColumn get limit => real()();
  IntColumn get month => integer()();
  IntColumn get year => integer()();

  @override
  Set<Column> get primaryKey => {id};
}

class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get entity => text()(); // 'expenses', 'categories', etc.
  TextColumn get entityId => text()();
  TextColumn get operation => text()(); // 'CREATE', 'UPDATE', 'DELETE'
  TextColumn get payload => text()(); // JSON string
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get lastAttempt => dateTime().nullable()();
}

@DriftDatabase(tables: [
  LocalUsers,
  LocalCategories,
  LocalExpenses,
  LocalIncomes,
  LocalBudgets,
  SyncQueue,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 3;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (m) async {
          await m.createAll();
        },
        onUpgrade: (m, from, to) async {
          if (from < 2) {
            await m.drop(localExpenses);
            await m.drop(syncQueue);
            await m.create(localExpenses);
            await m.create(syncQueue);
          }
          if (from < 3) {
            await m.drop(localCategories);
            await m.create(localCategories);
          }
        },
      );
}

QueryExecutor _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'expenseflow.db'));
    return NativeDatabase.createInBackground(file);
  });
}
