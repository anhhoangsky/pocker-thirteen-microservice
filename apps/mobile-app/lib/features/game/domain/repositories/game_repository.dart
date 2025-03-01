import 'package:poker_thirteen/features/game/domain/models/game.dart';

abstract class GameRepository {
  Future<Game> createGame(GameType type, Map<String, dynamic> metadata);
  Future<Game> joinGame(Map<String, dynamic>? playerInfo);
  Future<Map<String, dynamic>> recordScore(double points, int? rank);
  Future<Map<String, dynamic>> getTotalScores();
  Future<Map<String, dynamic>> getCurrentRound();
  Future<Game> endGame();
}