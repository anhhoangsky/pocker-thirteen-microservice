part of 'auth_bloc.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {
  const AuthCheckRequested();
}

class AuthLoginRequested extends AuthEvent {
  final String userId;
  final String username;
  final String? displayName;

  const AuthLoginRequested({
    required this.userId,
    required this.username,
    this.displayName,
  });

  @override
  List<Object?> get props => [userId, username, displayName];
}

class AuthLogoutRequested extends AuthEvent {
  const AuthLogoutRequested();
}