import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:injectable/injectable.dart';

@singleton
class TokenStorage {
  final FlutterSecureStorage _storage;
  static const String _tokenKey = 'auth_token';
  static const String _userIdKey = 'user_id';
  static const String _usernameKey = 'username';
  static const String _displayNameKey = 'display_name';

  TokenStorage() : _storage = const FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<void> saveUserId(String userId) async {
    await _storage.write(key: _userIdKey, value: userId);
  }

  Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }

  Future<void> saveUsername(String username) async {
    await _storage.write(key: _usernameKey, value: username);
  }

  Future<String?> getUsername() async {
    return await _storage.read(key: _usernameKey);
  }

  Future<void> saveDisplayName(String displayName) async {
    await _storage.write(key: _displayNameKey, value: displayName);
  }

  Future<String?> getDisplayName() async {
    return await _storage.read(key: _displayNameKey);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}