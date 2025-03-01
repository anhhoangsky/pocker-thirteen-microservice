import 'package:injectable/injectable.dart';
import 'package:poker_thirteen/core/network/api_client.dart';
import 'package:poker_thirteen/features/financial/domain/models/balance.dart';
import 'package:poker_thirteen/features/financial/domain/repositories/financial_repository.dart';

@Injectable(as: FinancialRepository)
class FinancialRepositoryImpl implements FinancialRepository {
  final ApiClient _apiClient;

  FinancialRepositoryImpl(this._apiClient);

  @override
  Future<Balance> getBalance() async {
    try {
      final response = await _apiClient.get('financial/balance');
      return Balance.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to get balance: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> getReport(String type) async {
    try {
      final response = await _apiClient.get('financial/report/$type');
      return response.data;
    } catch (e) {
      throw Exception('Failed to get report: $e');
    }
  }
}