import 'package:injectable/injectable.dart';
import 'package:poker_thirteen/core/network/api_client.dart';
import 'package:poker_thirteen/core/storage/token_storage.dart';
import 'package:poker_thirteen/features/auth/domain/models/user.dart';
import 'package:poker_thirteen/features/auth/domain/repositories/auth_repository.dart';

@Injectable(as: AuthRepository)
class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient;
  final TokenStorage _tokenStorage;

  AuthRepositoryImpl(this._apiClient, this._tokenStorage);

  @override
  Future<String> login(String userId, String username, String? displayName) async {
    try {
      final response = await _apiClient.post('auth/login', data: {
        'userId': userId,
        'username': username,
        'displayName': displayName,
      });

      final token = response.data['access_token'] as String;
      await _tokenStorage.saveToken(token);
      await _tokenStorage.saveUserId(userId);
      await _tokenStorage.saveUsername(username);
      if (displayName != null) {
        await _tokenStorage.saveDisplayName(displayName);
      }

      return token;
    } catch (e) {
      throw Exception('Failed to login: $e');
    }
  }

  @override
  Future<bool> isLoggedIn() async {
    final token = await _tokenStorage.getToken();
    return token != null;
  }

  @override
  Future<void> logout() async {
    await _tokenStorage.clearAll();
  }

  @override
  Future<User?> getCurrentUser() async {
    final userId = await _tokenStorage.getUserId();
    final username = await _tokenStorage.getUsername();
    final displayName = await _tokenStorage.getDisplayName();

    if (userId == null || username == null) {
      return null;
    }

    return User(
      id: userId,
      username: username,
      displayName: displayName,
    );
  }
}