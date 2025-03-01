part of 'game_bloc.dart';

abstract class GameState extends Equatable {
  const GameState();
  
  @override
  List<Object?> get props => [];
}

class GameInitial extends GameState {}

class GameLoading extends GameState {}

class GameCreated extends GameState {
  final Game game;

  const GameCreated(this.game);

  @override
  List<Object> get props => [game];
}

class GameJoined extends GameState {
  final Game game;

  const GameJoined(this.game);

  @override
  List<Object> get props => [game];
}

class ScoreRecorded extends GameState {
  final Map<String, dynamic> result;

  const ScoreRecorded(this.result);

  @override
  List<Object> get props => [result];
}

class TotalScoresLoaded extends GameState {
  final Map<String, dynamic> scores;

  const TotalScoresLoaded(this.scores);

  @override
  List<Object> get props => [scores];
}

class CurrentRoundLoaded extends GameState {
  final Map<String, dynamic> round;

  const CurrentRoundLoaded(this.round);

  @override
  List<Object> get props => [round];
}

class GameEnded extends GameState {
  final Game game;

  const GameEnded(this.game);

  @override
  List<Object> get props => [game];
}

class GameError extends GameState {
  final String message;

  const GameError(this.message);

  @override
  List<Object> get props => [message];
}