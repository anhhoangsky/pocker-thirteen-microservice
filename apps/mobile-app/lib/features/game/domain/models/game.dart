import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:poker_thirteen/features/game/domain/models/player.dart';
import 'package:poker_thirteen/features/game/domain/models/round.dart';

part 'game.g.dart';

enum GameType {
  @JsonValue('poker')
  poker,
  @JsonValue('tienlen')
  tienlen,
}

@JsonSerializable()
class Game extends Equatable {
  final String id;
  final GameType type;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? endedAt;
  final List<Player> players;
  final List<Round>? rounds;
  final Map<String, dynamic>? metadata;
  final int currentRoundNumber;

  const Game({
    required this.id,
    required this.type,
    required this.isActive,
    required this.createdAt,
    this.endedAt,
    required this.players,
    this.rounds,
    this.metadata,
    required this.currentRoundNumber,
  });

  factory Game.fromJson(Map<String, dynamic> json) => _$GameFromJson(json);

  Map<String, dynamic> toJson() => _$GameToJson(this);

  @override
  List<Object?> get props => [
        id,
        type,
        isActive,
        createdAt,
        endedAt,
        players,
        rounds,
        metadata,
        currentRoundNumber,
      ];
}