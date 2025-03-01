part of 'financial_bloc.dart';

abstract class FinancialEvent extends Equatable {
  const FinancialEvent();

  @override
  List<Object?> get props => [];
}

class GetBalanceRequested extends FinancialEvent {
  const GetBalanceRequested();
}

class GetReportRequested extends FinancialEvent {
  final String type;

  const GetReportRequested(this.type);

  @override
  List<Object> get props => [type];
}