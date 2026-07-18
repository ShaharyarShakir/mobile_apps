import 'dart:io';

abstract class AppException implements Exception {
  final String message;
  final String code;
  final int statusCode;

  AppException(this.message, this.code, this.statusCode);

  Map<String, dynamic> toJson() {
    return {
      'success': false,
      'message': message,
      'code': code,
    };
  }
}

class ValidationException extends AppException {
  ValidationException(String message)
      : super(message, 'VALIDATION_ERROR', HttpStatus.badRequest);
}

class NotFoundException extends AppException {
  NotFoundException(String message)
      : super(message, 'NOT_FOUND', HttpStatus.notFound);
}

class UnauthorizedException extends AppException {
  UnauthorizedException(String message)
      : super(message, 'UNAUTHORIZED', HttpStatus.unauthorized);
}

class ForbiddenException extends AppException {
  ForbiddenException(String message)
      : super(message, 'FORBIDDEN', HttpStatus.forbidden);
}

class DatabaseException extends AppException {
  DatabaseException(String message)
      : super(message, 'DATABASE_ERROR', HttpStatus.internalServerError);
}

class InternalServerException extends AppException {
  InternalServerException(String message)
      : super(message, 'INTERNAL_SERVER_ERROR', HttpStatus.internalServerError);
}
