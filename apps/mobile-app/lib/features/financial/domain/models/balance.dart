import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'balance.g.dart';

@JsonSerializable()
class Balance extends Equatable {
  final double amount;
  final DateTime lastUpdated;

  const Balance({
    required this.amount,
    required this.lastUpdated,
  });

  factory Balance.fromJson(Map<String, dynamic> json) => _$BalanceFromJson(json);

  Map<String, dynamic> toJson() => _$BalanceToJson(this);

  @override
  List<Object> get props => [amount, lastUpdated];
}