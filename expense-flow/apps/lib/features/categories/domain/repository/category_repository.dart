import 'package:mobile/core/utils/result.dart';
import 'package:shared_models/shared_models.dart';

abstract class CategoryRepository {
  Stream<List<Category>> watchCategories();
  Future<Result<List<Category>>> getCategories();
  Future<Result<Category>> createCategory({
    required String name,
    required String icon,
    required int color,
  });
  Future<Result<Category>> updateCategory(
    String id, {
    String? name,
    String? icon,
    int? color,
  });
  Future<Result<void>> deleteCategory(String id);
}
