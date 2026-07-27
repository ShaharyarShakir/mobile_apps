import 'package:api/features/expense/service/expense_service.dart';
import 'package:api/app/middleware/auth.dart';
import 'package:api/app/database/connection.dart';
import 'package:api/app/middleware/cors.dart';
import 'package:api/app/middleware/error_handler.dart';
import 'package:api/app/middleware/helmet.dart';
import 'package:api/app/middleware/rate_limiter.dart';
import 'package:api/app/middleware/request_id.dart';
import 'package:api/app/middleware/request_logger.dart';
import 'package:api/shared/repositories/repositories.dart';
import 'package:api/shared/repositories/repositories_impl.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

// Global database pool instance to reuse across requests
final Pool _dbPool = DatabaseConnection.createPool();

// Global repository instances wrapping the database pool
final UserRepository _userRepository = UserRepositoryImpl(_dbPool);
final CategoryRepository _categoryRepository = CategoryRepositoryImpl(_dbPool);
final ExpenseRepository _expenseRepository = ExpenseRepositoryImpl(_dbPool);
final IncomeRepository _incomeRepository = IncomeRepositoryImpl(_dbPool);
final BudgetRepository _budgetRepository = BudgetRepositoryImpl(_dbPool);

// Global services
final ExpenseService _expenseService = ExpenseService(
  expenseRepository: _expenseRepository,
  categoryRepository: _categoryRepository,
);

Handler middleware(Handler handler) {
  return handler
      // 1. Dependency injection (innermost, runs last)
      .use(provider<Pool>((_) => _dbPool))
      .use(provider<UserRepository>((_) => _userRepository))
      .use(provider<CategoryRepository>((_) => _categoryRepository))
      .use(provider<ExpenseRepository>((_) => _expenseRepository))
      .use(provider<IncomeRepository>((_) => _incomeRepository))
      .use(provider<BudgetRepository>((_) => _budgetRepository))
      .use(provider<ExpenseService>((_) => _expenseService))
      // 2. Authentication
      .use(authMiddleware())
      // 3. Security & Rate Limiting
      .use(rateLimiterMiddleware())
      .use(helmetMiddleware())
      .use(corsMiddleware())
      // 4. Exception Handling & Logging (outermost, runs first)
      .use(requestLoggerMiddleware())
      .use(errorHandlerMiddleware())
      .use(requestIdMiddleware());
}
