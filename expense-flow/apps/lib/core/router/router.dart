import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';

import '../../features/expenses/presentation/pages/expense_form_page.dart';
import '../../features/expenses/presentation/pages/expenses_page.dart';

import '../../features/expenses/presentation/pages/sync_settings_page.dart';

final goRouter = GoRouter(
  initialLocation: '/expenses',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardPage(),
    ),
    GoRoute(
      path: '/expenses',
      builder: (context, state) => const ExpensesPage(),
    ),
    GoRoute(
      path: '/expenses/form',
      builder: (context, state) {
        final id = state.uri.queryParameters['id'];
        return ExpenseFormPage(expenseId: id);
      },
    ),
    GoRoute(
      path: '/sync-settings',
      builder: (context, state) => const SyncSettingsPage(),
    ),
  ],
);
