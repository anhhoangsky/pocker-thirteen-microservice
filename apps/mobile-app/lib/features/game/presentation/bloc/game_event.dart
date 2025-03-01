part of 'game_bloc.dart';

abstract class GameEvent extends Equatable {
  const GameEvent();

  @override
  List<Object?> get props => [];
}

class CreateGameRequested extends GameEvent {
  final GameType type;
  final Map<String, dynamic> metadata;

  const CreateGameRequested({
    required this.type,
    required this.metadata,
  });

  @override
  List<Object?> get props => [type, metadata];
}

class JoinGameRequested extends GameEvent {
  final Map<String, dynamic>? playerInfo;

  const JoinGameRequested({this.playerInfo});

  @override
  List<Object?> get props => [playerInfo];
}

class RecordScoreRequested extends GameEvent {
  final double points;
  final int? rank;

  const RecordScoreRequested({
    required this.points,
    this.rank,
  });

  @override
  List<Object?> get props => [points, rank];
}

class GetTotalScoresRequested extends GameEvent {
  const GetTotalScoresRequested();
}

class GetCurrentRoundRequested extends GameEvent {
  const GetCurrentRoundRequested();
}

class EndGameRequested extends GameEvent {
  const EndGameRequested();
}