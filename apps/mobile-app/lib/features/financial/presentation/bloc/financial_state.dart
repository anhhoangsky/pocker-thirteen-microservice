part of 'financial_bloc.dart';

abstract class FinancialState extends Equatable {
  const FinancialState();
  
  @override
  List<Object?> get props => [];
}

class FinancialInitial extends FinancialState {}

class FinancialLoading extends FinancialState {}

class BalanceLoaded extends FinancialState {
  final Balance balance;

  const BalanceLoaded(this.balance);

  @override
  List<Object> get props => [balance];
}

class ReportLoaded extends FinancialState {
  final Map<String, dynamic> report;

  const ReportLoaded(this.report);

  @override
  List<Object> get props => [report];
}

class FinancialError extends FinancialState {
  final String message;

  const FinancialError(this.message);

  @override
  List<Object> get props => [message];
}