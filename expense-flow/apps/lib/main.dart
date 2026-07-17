import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';

void main() {
  final expense = Expense(
    id: '1',
    amount: 25.5,
    currency: 'USD',
    expenseDate: DateTime(2026, 7, 17),
    note: 'Coffee',
  );


  runApp(MyApp(expense));
}

class MyApp extends StatelessWidget {
  const MyApp(this.expense, {super.key});

  final Expense expense;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Text(expense.toJson().toString()),
        ),
      ),
    );
  }
}
