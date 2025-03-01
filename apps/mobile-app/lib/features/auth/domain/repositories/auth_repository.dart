import 'package:poker_thirteen/features/auth/domain/models/user.dart';

abstract class AuthRepository {
  Future<String> login(String userId, String username, String? displayName);
  Future<bool> isLoggedIn();
  Future<void> logout();
  Future<User?> getCurrentUser();
}