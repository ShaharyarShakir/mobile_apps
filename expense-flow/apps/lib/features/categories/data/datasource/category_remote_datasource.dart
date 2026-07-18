import 'package:mobile/core/network/network_client.dart';
import 'package:shared_models/shared_models.dart';

class CategoryRemoteDataSource {
  final NetworkClient _client;

  CategoryRemoteDataSource(this._client);

  Future<List<Category>> getCategories() async {
    final response = await _client.get('/api/v1/categories');
    final data = response.data['data'] as List;
    return data.map((json) => Category.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<Category> createCategory({
    required String name,
    required String icon,
    required int color,
  }) async {
    final response = await _client.post(
      '/api/v1/categories',
      data: {
        'name': name,
        'icon': icon,
        'color': color,
      },
    );
    return Category.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<Category> updateCategory(
    String id, {
    String? name,
    String? icon,
    int? color,
  }) async {
    final response = await _client.patch(
      '/api/v1/categories/$id',
      data: {
        if (name != null) 'name': name,
        if (icon != null) 'icon': icon,
        if (color != null) 'color': color,
      },
    );
    return Category.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<void> deleteCategory(String id) async {
    await _client.delete('/api/v1/categories/$id');
  }
}
