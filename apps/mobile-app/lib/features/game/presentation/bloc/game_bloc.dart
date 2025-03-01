import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import 'package:poker_thirteen/features/game/domain/models/game.dart';
import 'package:poker_thirteen/features/game/domain/repositories/game_repository.dart';

part 'game_event.dart';
part 'game_state.dart';

@injectable
class GameBloc extends Bloc<GameEvent, GameState> {
  final GameRepository _gameRepository;

  GameBloc(this._gameRepository) : super(GameInitial()) {
    on<CreateGameRequested>(_onCreateGameRequested);
    on<JoinGameRequested>(_onJoinGameRequested);
    on<RecordScoreRequested>(_onRecordScoreRequested);
    on<GetTotalScoresRequested>(_onGetTotalScoresRequested);
    on<GetCurrentRoundRequested>(_onGetCurrentRoundRequested);
    on<EndGameRequested>(_onEndGameRequested);
  }

  Future<void> _onCreateGameRequested(
    CreateGameRequested event,
    Emitter<GameState> emit,
  ) async {
    emit(GameLoading());
    try {
      final game = await _gameRepository.createGame(event.type, event.metadata);
      emit(GameCreated(game));
    } catch (e) {
      emit(GameError(e.toString()));
    }
  }

  Future<void> _onJoinGameRequested(
    JoinGameRequested event,
    Emitter<GameState> emit,
  ) async {
    emit(GameLoading());
    try {
      final game = await _gameRepository.joinGame(event.playerInfo);
      emit(GameJoined(game));
    } catch (e) {
      emit(GameError(e.toString()));
    }
  }

  Future<void> _onRecordScoreRequested(
    RecordScoreRequested event,
    Emitter<GameState> emit,
  ) async {
    emit(GameLoading());
    try {
      final result = await _gameRepository.recordScore(event.points, event.rank);
      emit(ScoreRecorded(result));
    } catch (e) {
      emit(GameError(e.toString()));
    }
  }

  Future<void> _onGetTotalScoresRequested(
    GetTotalScoresRequested event,
    Emitter<GameState> emit,
  ) async {
    emit(GameLoading());
    try {
      final result = await _gameRepository.getTotalScores();
      emit(TotalScoresLoaded(result));
    } catch (e) {
      emit(GameError(e.toString()));
    }
  }

  Future<void> _onGetCurrentRoundRequested(
    GetCurrentRoundRequested event,
    Emitter<GameState> emit,
  ) async {
    emit(GameLoading());
    try {
      final result = await _gameRepository.getCurrentRound();
      emit(CurrentRoundLoaded(result));
    } catch (e) {
      emit(GameError(e.toString()));
    }
  }

  Future<void> _onEndGameRequested(
    EndGameRequested event,
    Emitter<GameState> emit,
  ) async {
    emit(GameLoading());
    try {
      final game = await _gameRepository.endGame();
      emit(GameEnded(game));
    } catch (e) {
      emit(GameError(e.toString()));
    }
  }
}