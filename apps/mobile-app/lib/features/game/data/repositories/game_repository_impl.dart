import 'package:injectable/injectable.dart';
import 'package:poker_thirteen/core/network/api_client.dart';
import 'package:poker_thirteen/features/game/domain/models/game.dart';
import 'package:poker_thirteen/features/game/domain/repositories/game_repository.dart';

@Injectable(as: GameRepository)
class GameRepositoryImpl implements GameRepository {
  final ApiClient _apiClient;

  GameRepositoryImpl(this._apiClient);

  @override
  Future<Game> createGame(GameType type, Map<String, dynamic> metadata) async {
    try {
      final response = await _apiClient.post('games', data: {
        'type': type.toString().split('.').last,
        'metadata': metadata,
      });
      return Game.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create game: $e');
    }
  }

  @override
  Future<Game> joinGame(Map<String, dynamic>? playerInfo) async {
    try {
      final response = await _apiClient.post('games/join', data: {
        'playerInfo': playerInfo,
      });
      return Game.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to join game: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> recordScore(double points, int? rank) async {
    try {
      final response = await _apiClient.post('games/score', data: {
        'points': points,
        'rank': rank,
      });
      return response.data;
    } catch (e) {
      throw Exception('Failed to record score: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> getTotalScores() async {
    try {
      final response = await _apiClient.get('games/scores');
      return response.data;
    } catch (e) {
      throw Exception('Failed to get total scores: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> getCurrentRound() async {
    try {
      final response = await _apiClient.get('games/current-round');
      return response.data;
    } catch (e) {
      throw Exception('Failed to get current round: $e');
    }
  }

  @override
  Future<Game> endGame() async {
    try {
      final response = await _apiClient.post('games/end');
      return Game.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to end game: $e');
    }
  }
}