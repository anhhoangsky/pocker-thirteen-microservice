import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import 'package:poker_thirteen/features/financial/domain/models/balance.dart';
import 'package:poker_thirteen/features/financial/domain/repositories/financial_repository.dart';

part 'financial_event.dart';
part 'financial_state.dart';

@injectable
class FinancialBloc extends Bloc<FinancialEvent, FinancialState> {
  final FinancialRepository _financialRepository;

  FinancialBloc(this._financialRepository) : super(FinancialInitial()) {
    on<GetBalanceRequested>(_onGetBalanceRequested);
    on<GetReportRequested>(_onGetReportRequested);
  }

  Future<void> _onGetBalanceRequested(
    GetBalanceRequested event,
    Emitter<FinancialState> emit,
  ) async {
    emit(FinancialLoading());
    try {
      final balance = await _financialRepository.getBalance();
      emit(BalanceLoaded(balance));
    } catch (e) {
      emit(FinancialError(e.toString()));
    }
  }

  Future<void> _onGetReportRequested(
    GetReportRequested event,
    Emitter<FinancialState> emit,
  ) async {
    emit(FinancialLoading());
    try {
      final report = await _financialRepository.getReport(event.type);
      emit(ReportLoaded(report));
    } catch (e) {
      emit(FinancialError(e.toString()));
    }
  }
}