import 'dart:io';
import 'package:api/app/constants/constants.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

Future<Response> onRequest(RequestContext context) async {
  if (context.request.method != HttpMethod.get) {
    return Response(statusCode: HttpStatus.methodNotAllowed);
  }

  final difference = DateTime.now().difference(AppConstants.startupTime);
  final hours = difference.inHours.toString().padLeft(2, '0');
  final minutes = (difference.inMinutes % 60).toString().padLeft(2, '0');
  final seconds = (difference.inSeconds % 60).toString().padLeft(2, '0');
  final uptime = '$hours:$minutes:$seconds';

  try {
    final pool = context.read<Pool>();
    await pool.execute('SELECT 1;');
    return Response.json(
      body: {
        'status': 'healthy',
        'database': 'connected',
        'version': AppConstants.serverVersion,
        'uptime': uptime,
      },
    );
  } catch (e) {
    return Response.json(
      statusCode: HttpStatus.internalServerError,
      body: {
        'status': 'unhealthy',
        'database': 'disconnected',
        'version': AppConstants.serverVersion,
        'uptime': uptime,
        'error': e.toString(),
      },
    );
  }
}
