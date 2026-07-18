import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_models/shared_models.dart';
import 'package:mobile/core/providers/providers.dart';
import 'package:mobile/core/utils/result.dart';
import 'package:mobile/core/services/sync_service.dart';
import '../../data/datasource/category_local_datasource.dart';
import '../../data/datasource/category_remote_datasource.dart';
import '../../data/repository/category_repository_impl.dart';
import '../../domain/repository/category_repository.dart';

final categoryRemoteDataSourceProvider = Provider<CategoryRemoteDataSource>((ref) {
  return CategoryRemoteDataSource(ref.read(networkClientProvider));
});

final categoryLocalDataSourceProvider = Provider<CategoryLocalDataSource>((ref) {
  return CategoryLocalDataSource(ref.read(databaseProvider));
});

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  return CategoryRepositoryImpl(
    remoteDataSource: ref.read(categoryRemoteDataSourceProvider),
    localDataSource: ref.read(categoryLocalDataSourceProvider),
  );
});

final categoryListProvider = StreamProvider<List<Category>>((ref) {
  ref.read(categoryRepositoryProvider).getCategories();
  return ref.read(categoryRepositoryProvider).watchCategories();
});

class CategoryController extends AsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<Result<Category>> createCategory({
    required String name,
    required String icon,
    required int color,
  }) async {
    state = const AsyncValue.loading();
    final repository = ref.read(categoryRepositoryProvider);
    final result = await repository.createCategory(
      name: name,
      icon: icon,
      color: color,
    );
    if (result is Success<Category>) {
      ref.read(syncServiceProvider.notifier).sync();
    }
    state = const AsyncValue.data(null);
    return result;
  }

  Future<Result<Category>> updateCategory(
    String id, {
    String? name,
    String? icon,
    int? color,
  }) async {
    state = const AsyncValue.loading();
    final repository = ref.read(categoryRepositoryProvider);
    final result = await repository.updateCategory(
      id,
      name: name,
      icon: icon,
      color: color,
    );
    if (result is Success<Category>) {
      ref.read(syncServiceProvider.notifier).sync();
    }
    state = const AsyncValue.data(null);
    return result;
  }

  Future<Result<void>> deleteCategory(String id) async {
    state = const AsyncValue.loading();
    final repository = ref.read(categoryRepositoryProvider);
    final result = await repository.deleteCategory(id);
    if (result is Success<void>) {
      ref.read(syncServiceProvider.notifier).sync();
    }
    state = const AsyncValue.data(null);
    return result;
  }
}

final categoryControllerProvider =
    AsyncNotifierProvider.autoDispose<CategoryController, void>(
  CategoryController.new,
);
