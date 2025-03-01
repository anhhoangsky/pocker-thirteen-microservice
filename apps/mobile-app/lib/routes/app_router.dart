import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:poker_thirteen/features/auth/presentation/pages/login_page.dart';
import 'package:poker_thirteen/features/auth/presentation/pages/splash_page.dart';
import 'package:poker_thirteen/features/game/presentation/pages/create_game_page.dart';
import 'package:poker_thirteen/features/game/presentation/pages/game_details_page.dart';
import 'package:poker_thirteen/features/game/presentation/pages/home_page.dart';
import 'package:poker_thirteen/features/game/presentation/pages/record_score_page.dart';
import 'package:poker_thirteen/features/financial/presentation/pages/balance_page.dart';
import 'package:poker_thirteen/features/financial/presentation/pages/report_page.dart';

part 'app_router.gr.dart';

@AutoRouterConfig()
class AppRouter extends _$AppRouter {
  @override
  List<AutoRoute> get routes => [
        AutoRoute(page: SplashRoute.page, initial: true),
        AutoRoute(page: LoginRoute.page),
        AutoRoute(page: HomeRoute.page),
        AutoRoute(page: CreateGameRoute.page),
        AutoRoute(page: GameDetailsRoute.page),
        AutoRoute(page: RecordScoreRoute.page),
        AutoRoute(page: BalanceRoute.page),
        AutoRoute(page: ReportRoute.page),
      ];
}