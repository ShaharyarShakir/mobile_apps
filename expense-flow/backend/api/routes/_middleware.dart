import 'package:api/database/db_context.dart';
import 'package:api/database/repositories/repositories.dart';
import 'package:api/database/repositories/repositories_impl.dart';
import 'package:dart_frog/dart_frog.dart';
import 'package:postgres/postgres.dart';

// Global database pool instance to reuse across requests
final Pool _dbPool = DbContext.createPool();

// Global repository instances wrapping the database pool
final UserRepository _userRepository = UserRepositoryImpl(_dbPool);
final CategoryRepository _categoryRepository = CategoryRepositoryImpl(_dbPool);
final ExpenseRepository _expenseRepository = ExpenseRepositoryImpl(_dbPool);
final IncomeRepository _incomeRepository = IncomeRepositoryImpl(_dbPool);
final BudgetRepository _budgetRepository = BudgetRepositoryImpl(_dbPool);

Handler middleware(Handler handler) {
  return handler
      .use(provider<Pool>((_) => _dbPool))
      .use(provider<UserRepository>((_) => _userRepository))
      .use(provider<CategoryRepository>((_) => _categoryRepository))
      .use(provider<ExpenseRepository>((_) => _expenseRepository))
      .use(provider<IncomeRepository>((_) => _incomeRepository))
      .use(provider<BudgetRepository>((_) => _budgetRepository));
}
