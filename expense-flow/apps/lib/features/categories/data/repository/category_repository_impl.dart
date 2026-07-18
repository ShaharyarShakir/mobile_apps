import 'dart:convert';
import 'package:mobile/core/database/local_database.dart';
import 'package:mobile/core/utils/result.dart';
import 'package:mobile/features/expenses/domain/entity/sync_status.dart';
import 'package:shared_models/shared_models.dart';
import 'package:uuid/uuid.dart';
import '../../domain/repository/category_repository.dart';
import '../datasource/category_local_datasource.dart';
import '../datasource/category_remote_datasource.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  final CategoryRemoteDataSource _remoteDataSource;
  final CategoryLocalDataSource _localDataSource;
  final _uuid = const Uuid();

  CategoryRepositoryImpl({
    required CategoryRemoteDataSource remoteDataSource,
    required CategoryLocalDataSource localDataSource,
  })  : _remoteDataSource = remoteDataSource,
        _localDataSource = localDataSource;

  Category _mapLocalToDomain(LocalCategory local) {
    return Category(
      id: local.id,
      userId: local.userId,
      name: local.name,
      icon: local.icon,
      color: local.color,
      syncStatus: local.syncStatus,
    );
  }

  LocalCategory _mapDomainToLocal(Category domain) {
    return LocalCategory(
      id: domain.id,
      userId: domain.userId ?? '00000000-0000-0000-0000-000000000000',
      name: domain.name,
      icon: domain.icon,
      color: domain.color,
      syncStatus: domain.syncStatus ?? SyncStatus.synced.name,
    );
  }

  @override
  Stream<List<Category>> watchCategories() {
    return _localDataSource.watchAllCategories().map(
          (list) => list.map<Category>(_mapLocalToDomain).toList(),
        );
  }

  @override
  Future<Result<List<Category>>> getCategories() async {
    final localList = await _localDataSource.getAllCategories();
    return Success(localList.map<Category>(_mapLocalToDomain).toList());
  }

  @override
  Future<Result<Category>> createCategory({
    required String name,
    required String icon,
    required int color,
  }) async {
    final id = _uuid.v4();
    final localCategory = Category(
      id: id,
      userId: '00000000-0000-0000-0000-000000000000',
      name: name,
      icon: icon,
      color: color,
      syncStatus: SyncStatus.pending.name,
    );

    await _localDataSource.saveCategory(_mapDomainToLocal(localCategory));

    await _localDataSource.addToSyncQueue(
      entity: 'categories',
      entityId: id,
      operation: 'CREATE',
      payload: jsonEncode(localCategory.toJson()),
    );

    return Success(localCategory);
  }

  @override
  Future<Result<Category>> updateCategory(
    String id, {
    String? name,
    String? icon,
    int? color,
  }) async {
    final local = await _localDataSource.getCategoryById(id);
    if (local == null) {
      return const Failure('Category not found.');
    }

    final updatedLocal = _mapLocalToDomain(local).copyWith(
      name: name ?? local.name,
      icon: icon ?? local.icon,
      color: color ?? local.color,
      syncStatus: SyncStatus.pending.name,
    );

    await _localDataSource.saveCategory(_mapDomainToLocal(updatedLocal));

    await _localDataSource.addToSyncQueue(
      entity: 'categories',
      entityId: id,
      operation: 'UPDATE',
      payload: jsonEncode(updatedLocal.toJson()),
    );

    return Success(updatedLocal);
  }

  @override
  Future<Result<void>> deleteCategory(String id) async {
    final local = await _localDataSource.getCategoryById(id);
    if (local == null) {
      return const Failure('Category not found.');
    }

    await _localDataSource.deleteCategory(id);

    await _localDataSource.addToSyncQueue(
      entity: 'categories',
      entityId: id,
      operation: 'DELETE',
      payload: '{}',
    );

    return const Success(null);
  }
}
