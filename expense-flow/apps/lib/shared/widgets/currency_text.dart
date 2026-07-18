import 'package:flutter/material.dart';

class CurrencyText extends StatelessWidget {
  final double amount;
  final TextStyle? style;
  final String symbol;

  const CurrencyText({
    required this.amount,
    this.style,
    this.symbol = '\$',
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final formattedAmount = amount.toStringAsFixed(2);
    return Text(
      '$symbol$formattedAmount',
      style: style ?? Theme.of(context).textTheme.bodyLarge,
    );
  }
}
