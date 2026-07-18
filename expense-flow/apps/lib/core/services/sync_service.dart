import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/core/database/local_database.dart';
import 'package:mobile/core/providers/providers.dart';
import 'package:mobile/features/expenses/data/datasource/remote/expense_remote_datasource.dart';
import 'package:mobile/features/expenses/domain/entity/sync_status.dart';
import 'package:mobile/features/expenses/presentation/providers/expense_providers.dart';
import 'package:mobile/features/categories/presentation/providers/category_providers.dart';
import 'connectivity_service.dart';

class SyncService extends Notifier<bool> {
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  AppDatabase get _database => ref.read(databaseProvider);
  ExpenseRemoteDataSource get _remoteDataSource => ref.read(expenseRemoteDataSourceProvider);
  ConnectivityService get _connectivityService => ref.read(connectivityServiceProvider.notifier);

  @override
  bool build() {
    ref.listen(connectivityServiceProvider, (previous, next) {
      if (next == true) {
        sync();
      }
    });
    return false;
  }

  bool get isSyncing => state;

  Future<void> sync() async {
    if (state) return;
    if (!_connectivityService.isConnected) {
      debugPrint('Sync skipped: Offline');
      return;
    }

    state = true;
    try {
      debugPrint('Sync started...');
      await uploadQueue();
      await downloadChanges();
      debugPrint('Sync finished successfully.');
    } catch (e, stack) {
      debugPrint('Sync failed: $e\n$stack');
    } finally {
      state = false;
    }
  }

  Future<void> uploadQueue() async {
    final queueItems = await (_database.select(_database.syncQueue)
          ..orderBy([(t) => OrderingTerm(expression: t.id)]))
        .get();

    for (final item in queueItems) {
      if (!_connectivityService.isConnected) break;

      await (_database.update(_database.syncQueue)..where((t) => t.id.equals(item.id)))
          .write(
        SyncQueueCompanion(
          retryCount: Value(item.retryCount + 1),
          lastAttempt: Value(DateTime.now()),
        ),
      );

      final payload = jsonDecode(item.payload) as Map<String, dynamic>;
      bool success = false;
      bool permanentFailure = false;

      try {
        if (item.entity == 'expenses') {
          await _updateLocalExpenseStatus(item.entityId, SyncStatus.syncing.name);

          // Optimistically upload receipt to S3/Garage if it's a local file path
          final receiptUrl = payload['receiptUrl'] as String?;
          if (receiptUrl != null && !receiptUrl.startsWith('http')) {
            try {
              final remoteUrl = await _remoteDataSource.uploadReceipt(item.entityId, receiptUrl);
              payload['receiptUrl'] = remoteUrl;
              
              await (_database.update(_database.localExpenses)
                    ..where((t) => t.id.equals(item.entityId)))
                  .write(
                LocalExpensesCompanion(
                  receiptUrl: Value(remoteUrl),
                ),
              );
            } catch (e) {
              debugPrint('Failed to upload local receipt during sync: $e');
              rethrow;
            }
          }

          if (item.operation == 'CREATE') {
            await _remoteDataSource.createExpense(
              categoryId: payload['categoryId'] as String?,
              amount: (payload['amount'] as num).toDouble(),
              currency: payload['currency'] as String,
              note: payload['note'] as String? ?? '',
              expenseDate: DateTime.parse(payload['expenseDate'] as String),
              receiptUrl: payload['receiptUrl'] as String?,
            );
            success = true;
          } else if (item.operation == 'UPDATE') {
            await _remoteDataSource.updateExpense(
              item.entityId,
              categoryId: payload['categoryId'] as String?,
              amount: (payload['amount'] as num?)?.toDouble(),
              currency: payload['currency'] as String?,
              note: payload['note'] as String?,
              expenseDate: payload['expenseDate'] != null
                  ? DateTime.parse(payload['expenseDate'] as String)
                  : null,
              receiptUrl: payload['receiptUrl'] as String?,
            );
            success = true;
          } else if (item.operation == 'DELETE') {
            await _remoteDataSource.deleteExpense(item.entityId);
            success = true;
          }
        } else if (item.entity == 'categories') {
          await _updateLocalCategoryStatus(item.entityId, SyncStatus.syncing.name);
          final categoryRemote = ref.read(categoryRemoteDataSourceProvider);

          if (item.operation == 'CREATE') {
            await categoryRemote.createCategory(
              name: payload['name'] as String,
              icon: payload['icon'] as String,
              color: payload['color'] as int,
            );
            success = true;
          } else if (item.operation == 'UPDATE') {
            await categoryRemote.updateCategory(
              item.entityId,
              name: payload['name'] as String?,
              icon: payload['icon'] as String?,
              color: payload['color'] as int?,
            );
            success = true;
          } else if (item.operation == 'DELETE') {
            await categoryRemote.deleteCategory(item.entityId);
            success = true;
          }
        }
      } catch (e) {
        debugPrint('Failed to sync queue item ${item.id}: $e');
        if (e is DioException) {
          final statusCode = e.response?.statusCode;
          if (statusCode != null && statusCode >= 400 && statusCode < 500) {
            permanentFailure = true;
          }
        }
      }

      if (success) {
        await (_database.delete(_database.syncQueue)..where((t) => t.id.equals(item.id)))
            .go();
        if (item.entity == 'expenses') {
          await _updateLocalExpenseStatus(item.entityId, SyncStatus.synced.name);
          if (item.operation == 'DELETE') {
            await (_database.delete(_database.localExpenses)
                  ..where((t) => t.id.equals(item.entityId)))
                .go();
          }
        } else if (item.entity == 'categories') {
          await _updateLocalCategoryStatus(item.entityId, SyncStatus.synced.name);
          if (item.operation == 'DELETE') {
            await (_database.delete(_database.localCategories)
                  ..where((t) => t.id.equals(item.entityId)))
                .go();
          }
        }
      } else {
        if (permanentFailure || item.retryCount >= 4) {
          if (item.entity == 'expenses') {
            await _updateLocalExpenseStatus(item.entityId, SyncStatus.failed.name);
          } else if (item.entity == 'categories') {
            await _updateLocalCategoryStatus(item.entityId, SyncStatus.failed.name);
          }
          await (_database.delete(_database.syncQueue)..where((t) => t.id.equals(item.id)))
              .go();
        } else {
          if (item.entity == 'expenses') {
            await _updateLocalExpenseStatus(item.entityId, SyncStatus.pending.name);
          } else if (item.entity == 'categories') {
            await _updateLocalCategoryStatus(item.entityId, SyncStatus.pending.name);
          }
        }
      }
    }
  }

  Future<void> _updateLocalExpenseStatus(String id, String status) async {
    await (_database.update(_database.localExpenses)..where((t) => t.id.equals(id))).write(
      LocalExpensesCompanion(
        syncStatus: Value(status),
      ),
    );
  }

  Future<void> _updateLocalCategoryStatus(String id, String status) async {
    await (_database.update(_database.localCategories)..where((t) => t.id.equals(id))).write(
      LocalCategoriesCompanion(
        syncStatus: Value(status),
      ),
    );
  }

  Future<void> downloadChanges() async {
    final lastSyncStr = await _secureStorage.read(key: 'lastSyncAt');
    final lastSync = lastSyncStr != null ? DateTime.tryParse(lastSyncStr) : null;

    final remoteExpenses = await _remoteDataSource.getExpenses(
      modifiedSince: lastSync,
      includeDeleted: true,
    );

    final categoryRemote = ref.read(categoryRemoteDataSourceProvider);
    final remoteCategories = await categoryRemote.getCategories();

    await _database.transaction(() async {
      // Sync categories first to satisfy foreign reference constraints on expenses
      for (final remote in remoteCategories) {
        final local = await (_database.select(_database.localCategories)
              ..where((t) => t.id.equals(remote.id)))
            .getSingleOrNull();

        if (local == null) {
          await _database.into(_database.localCategories).insert(
                LocalCategoriesCompanion.insert(
                  id: remote.id,
                  userId: remote.userId ?? 'system',
                  name: remote.name,
                  icon: remote.icon,
                  color: remote.color,
                  syncStatus: const Value('synced'),
                ),
              );
        } else {
          await (_database.update(_database.localCategories)
                ..where((t) => t.id.equals(remote.id)))
              .write(
            LocalCategoriesCompanion(
              name: Value(remote.name),
              icon: Value(remote.icon),
              color: Value(remote.color),
              syncStatus: const Value('synced'),
            ),
          );
        }
      }

      for (final remote in remoteExpenses) {
        final local = await (_database.select(_database.localExpenses)
              ..where((t) => t.id.equals(remote.id)))
            .getSingleOrNull();

        if (local == null) {
          if (remote.deletedAt == null) {
            await _database.into(_database.localExpenses).insert(
                  LocalExpensesCompanion.insert(
                    id: remote.id,
                    userId: remote.userId,
                    categoryId: Value(remote.categoryId),
                    amount: remote.amount,
                    currency: Value(remote.currency),
                    note: Value(remote.note),
                    expenseDate: remote.expenseDate,
                    receiptUrl: Value(remote.receiptUrl),
                    syncStatus: const Value('synced'),
                    createdAt: remote.createdAt,
                    updatedAt: Value(remote.updatedAt),
                    deletedAt: Value(remote.deletedAt),
                  ),
                );
          }
        } else {
          final remoteUpdatedAt = remote.updatedAt ?? remote.createdAt;
          final localUpdatedAt = local.updatedAt ?? local.createdAt;

          if (remoteUpdatedAt.isAfter(localUpdatedAt)) {
            if (remote.deletedAt != null) {
              await (_database.delete(_database.localExpenses)
                    ..where((t) => t.id.equals(remote.id)))
                  .go();
            } else {
              await (_database.update(_database.localExpenses)
                    ..where((t) => t.id.equals(remote.id)))
                  .write(
                LocalExpensesCompanion(
                  categoryId: Value(remote.categoryId),
                  amount: Value(remote.amount),
                  currency: Value(remote.currency),
                  note: Value(remote.note),
                  expenseDate: Value(remote.expenseDate),
                  receiptUrl: Value(remote.receiptUrl),
                  syncStatus: const Value('synced'),
                  updatedAt: Value(remote.updatedAt),
                  deletedAt: Value(remote.deletedAt),
                ),
              );
            }
          }
        }
      }
    });

    await _secureStorage.write(
      key: 'lastSyncAt',
      value: DateTime.now().toIso8601String(),
    );
  }
}

final syncServiceProvider = NotifierProvider<SyncService, bool>(SyncService.new);
