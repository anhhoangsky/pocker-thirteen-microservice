import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:poker_thirteen/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:poker_thirteen/features/game/presentation/bloc/game_bloc.dart';
import 'package:poker_thirteen/routes/app_router.dart';

@RoutePage()
class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    context.read<GameBloc>().add(const GetTotalScoresRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Poker Thirteen'),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_balance_wallet),
            onPressed: () => context.router.push(const BalanceRoute()),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              context.read<AuthBloc>().add(const AuthLogoutRequested());
              context.router.replace(const LoginRoute());
            },
          ),
        ],
      ),
      body: BlocBuilder<GameBloc, GameState>(
        builder: (context, state) {
          if (state is GameLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is TotalScoresLoaded) {
            final playerScores = state.scores['playerScores'] as List<dynamic>? ?? [];
            
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Current Game Scores',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          if (playerScores.isEmpty)
                            const Text('No active game or no scores recorded yet.')
                          else
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: playerScores.length,
                              itemBuilder: (context, index) {
                                final score = playerScores[index];
                                return ListTile(
                                  title: Text(score['playerName'] ?? 'Unknown Player'),
                                  trailing: Text(
                                    '${score['totalPoints']} points',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                );
                              },
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => context.router.push(const CreateGameRoute()),
                          child: const Text('New Game'),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => context.router.push(const RecordScoreRoute()),
                          child: const Text('Record Score'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          } else if (state is GameError) {
            return Center(
              child: Text('Error: ${state.message}'),
            );
          } else {
            return const Center(
              child: Text('No game data available'),
            );
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.read<GameBloc>().add(const GetTotalScoresRequested()),
        child: const Icon(Icons.refresh),
      ),
    );
  }
}