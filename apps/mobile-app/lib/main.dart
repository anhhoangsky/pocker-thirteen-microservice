import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:poker_thirteen/core/di/injection.dart';
import 'package:poker_thirteen/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:poker_thirteen/features/game/presentation/bloc/game_bloc.dart';
import 'package:poker_thirteen/features/financial/presentation/bloc/financial_bloc.dart';
import 'package:poker_thirteen/routes/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  MyApp({Key? key}) : super(key: key);

  final _appRouter = AppRouter();

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => getIt<AuthBloc>()),
        BlocProvider(create: (_) => getIt<GameBloc>()),
        BlocProvider(create: (_) => getIt<FinancialBloc>()),
      ],
      child: MaterialApp.router(
        title: 'Poker Thirteen',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
        routerDelegate: _appRouter.delegate(),
        routeInformationParser: _appRouter.defaultRouteParser(),
      ),
    );
  }
}