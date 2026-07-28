import 'package:intl/intl.dart';

class CurrencyFormatter {
  static String format(double amount, {String currency = 'USD'}) {
    return NumberFormat.currency(name: currency, symbol: currency).format(amount);
  }
}
