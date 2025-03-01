import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:poker_thirteen/features/game/domain/models/player.dart';

part 'game_score.g.dart';

@JsonSerializable()
class GameScore extends Equatable {
  final String id;
  final Player player;
  final double points;
  final double amount;
  final int roundNumber;
  final Map<String, dynamic>? metadata;

  const GameScore({
    required this.id,
    required this.player,
    required this.points,
    required this.amount,
    required this.roundNumber,
    this.metadata,
  });

  factory GameScore.fromJson(Map<String, dynamic> json) => _$GameScoreFromJson(json);

  Map<String, dynamic> toJson() => _$GameScoreToJson(this);

  @override
  List<Object?> get props => [id, player, points, amount, roundNumber, metadata];
}