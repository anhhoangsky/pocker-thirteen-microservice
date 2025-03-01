import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'player.g.dart';

@JsonSerializable()
class Player extends Equatable {
  final String id;
  final String telegramId;
  final String username;
  final String? displayName;
  final DateTime createdAt;
  final double balance;

  const Player({
    required this.id,
    required this.telegramId,
    required this.username,
    this.displayName,
    required this.createdAt,
    required this.balance,
  });

  factory Player.fromJson(Map<String, dynamic> json) => _$PlayerFromJson(json);

  Map<String, dynamic> toJson() => _$PlayerToJson(this);

  @override
  List<Object?> get props => [id, telegramId, username, displayName, createdAt, balance];
}