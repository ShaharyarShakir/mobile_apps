import 'dart:convert';
import 'dart:io';
import 'package:api/app/middleware/context_types.dart';
import 'package:api/shared/models/models.dart';
import 'package:api/shared/repositories/repositories.dart';
import 'package:api/shared/utils/s3_signer.dart';
import 'package:dart_frog/dart_frog.dart';

class GarageConfig {
  static final String endpoint = Platform.environment['GARAGE_ENDPOINT'] ?? 'http://localhost:3900';
  static final String region = Platform.environment['GARAGE_REGION'] ?? 'garage';
  static final String bucket = Platform.environment['GARAGE_BUCKET'] ?? 'receipts';

  static String? _accessKey;
  static String? _secretKey;

  static void loadCredentials() {
    _accessKey = Platform.environment['GARAGE_ACCESS_KEY'];
    _secretKey = Platform.environment['GARAGE_SECRET_KEY'];

    if (_accessKey != null && _secretKey != null) return;

    final containerFile = File('/shared/.env.garage');
    if (containerFile.existsSync()) {
      _parseEnvFile(containerFile);
      return;
    }

    final hostFile = File('/home/shaharyar/01__git_repos/mobile_apps/expense-flow/infrastructure/docker/shared/.env.garage');
    if (hostFile.existsSync()) {
      _parseEnvFile(hostFile);
      return;
    }
  }

  static void _parseEnvFile(File file) {
    try {
      final lines = file.readAsLinesSync();
      for (final line in lines) {
        final parts = line.split('=');
        if (parts.length >= 2) {
          final key = parts[0].trim();
          final val = parts[1].trim();
          if (key == 'GARAGE_ACCESS_KEY') _accessKey = val;
          if (key == 'GARAGE_SECRET_KEY') _secretKey = val;
        }
      }
    } catch (_) {}
  }

  static String get accessKey {
    if (_accessKey == null) loadCredentials();
    return _accessKey ?? 'my-key';
  }

  static String get secretKey {
    if (_secretKey == null) loadCredentials();
    return _secretKey ?? 'my-secret';
  }
}

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.post) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  final user = context.read<AuthenticatedUser>();
  final formData = await context.request.formData();
  final file = formData.files['file'];
  final expenseId = formData.fields['expenseId'];

  if (file == null || expenseId == null) {
    return Response.json(
      statusCode: HttpStatus.badRequest,
      body: {
        'success': false,
        'message': 'File and expenseId are required.',
      },
    );
  }

  final fileBytes = await file.readAsBytes();
  final fileName = file.name;
  
  final hostUri = Uri.parse(GarageConfig.endpoint);
  final host = hostUri.host;
  final port = hostUri.port;
  final scheme = hostUri.scheme;
  
  final path = '/${GarageConfig.bucket}/$expenseId-$fileName';
  final uri = Uri(
    scheme: scheme,
    host: host,
    port: port,
    path: path,
  );

  final client = HttpClient();
  try {
    final requestHeaders = S3Signer.signPutRequest(
      host: port == 80 || port == 443 || port == 0 ? host : '$host:$port',
      path: path,
      accessKey: GarageConfig.accessKey,
      secretKey: GarageConfig.secretKey,
      region: GarageConfig.region,
      payloadBytes: fileBytes,
    );

    final request = await client.putUrl(uri);
    requestHeaders.forEach((key, value) {
      request.headers.set(key, value);
    });
    request.headers.contentType = ContentType.parse(file.contentType.mimeType);
    request.add(fileBytes);
    
    final response = await request.close();
    if (response.statusCode != HttpStatus.ok && response.statusCode != HttpStatus.created) {
      final responseBody = await response.transform(utf8.decoder).join();
      return Response.json(
        statusCode: HttpStatus.internalServerError,
        body: {
          'success': false,
          'message': 'Failed to upload to S3. Status: ${response.statusCode}, Body: $responseBody',
        },
      );
    }

    final publicUrl = '${GarageConfig.endpoint}/${GarageConfig.bucket}/$expenseId-$fileName';

    final expenseRepo = context.read<ExpenseRepository>();
    final existing = await expenseRepo.getById(expenseId);
    if (existing != null && existing.userId == user.id) {
      await expenseRepo.update(
        Expense(
          id: existing.id,
          userId: existing.userId,
          categoryId: existing.categoryId,
          amount: existing.amount,
          currency: existing.currency,
          note: existing.note,
          expenseDate: existing.expenseDate,
          receiptUrl: publicUrl,
          createdAt: existing.createdAt,
          updatedAt: DateTime.now(),
          deletedAt: existing.deletedAt,
        ),
      );
    }

    return Response.json(
      body: {
        'success': true,
        'url': publicUrl,
      },
    );
  } catch (e) {
    return Response.json(
      statusCode: HttpStatus.internalServerError,
      body: {
        'success': false,
        'message': 'Upload error: $e',
      },
    );
  } finally {
    client.close();
  }
}
