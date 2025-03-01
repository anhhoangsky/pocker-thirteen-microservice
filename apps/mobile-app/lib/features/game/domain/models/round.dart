import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:poker_thirteen/features/game/domain/models/game_score.dart';

part 'round.g.dart';

@JsonSerializable()
class Round extends Equatable {
  final String id;
  final int roundNumber;
  final bool isCompleted;
  final DateTime? completedAt;
  final List<GameScore> scores;

  const Round({
    required this.id,
    required this.roundNumber,
    required this.isCompleted,
    this.completedAt,
    required this.scores,
  });

  factory Round.fromJson(Map<String, dynamic> json) => _$RoundFromJson(json);

  Map<String, dynamic> toJson() => _$RoundToJson(this);

  @override
  List<Object?> get props => [id, roundNumber, isCompleted, completedAt, scores];
}