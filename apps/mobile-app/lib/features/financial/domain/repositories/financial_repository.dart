import 'package:poker_thirteen/features/financial/domain/models/balance.dart';

abstract class FinancialRepository {
  Future<Balance> getBalance();
  Future<Map<String, dynamic>> getReport(String type);
}