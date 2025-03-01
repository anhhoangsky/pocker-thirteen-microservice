import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:poker_thirteen/features/game/domain/models/game.dart';
import 'package:poker_thirteen/features/game/presentation/bloc/game_bloc.dart';
import 'package:poker_thirteen/routes/app_router.dart';

@RoutePage()
class CreateGamePage extends StatefulWidget {
  const CreateGamePage({Key? key}) : super(key: key);

  @override
  State<CreateGamePage> createState() => _CreateGamePageState();
}

class _CreateGamePageState extends State<CreateGamePage> {
  GameType _selectedGameType = GameType.poker;
  int _maxPlayers = 9;
  double _pointValue = 0.1;
  int _initialPoints = 500;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create New Game'),
      ),
      body: BlocConsumer<GameBloc, GameState>(
        listener: (context, state) {
          if (state is GameCreated) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Game created successfully!')),
            );
            context.router.pop();
          } else if (state is GameError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: ${state.message}')),
            );
          }
        },
        builder: (context, state) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Game Type',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<GameType>(
                          value: _selectedGameType,
                          onChanged: (value) {
                            setState(() {
                              _selectedGameType = value!;
                              if (value == GameType.tienlen) {
                                _maxPlayers = 4;
                                _pointValue = 1.0;
                                _initialPoints = 0;
                              } else {
                                _maxPlayers = 9;
                                _pointValue = 0.1;
                                _initialPoints = 500;
                              }
                            });
                          },
                          items: const [
                            DropdownMenuItem(
                              value: GameType.poker,
                              child: Text('Poker'),
                            ),
                            DropdownMenuItem(
                              value: GameType.tienlen,
                              child: Text('Tiến Lên'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Game Settings',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ListTile(
                          title: const Text('Max Players'),
                          trailing: Text('$_maxPlayers'),
                          subtitle: Slider(
                            value: _maxPlayers.toDouble(),
                            min: _selectedGameType == GameType.tienlen ? 4 : 2,
                            max: _selectedGameType == GameType.tienlen ? 4 : 9,
                            divisions: _selectedGameType == GameType.tienlen ? 0 : 7,
                            onChanged: (value) {
                              setState(() {
                                _maxPlayers = value.toInt();
                              });
                            },
                          ),
                        ),
                        ListTile(
                          title: const Text('Point Value'),
                          trailing: Text('$_pointValue'),
                          subtitle: Slider(
                            value: _pointValue,
                            min: 0.1,
                            max: 10.0,
                            divisions: 99,
                            onChanged: (value) {
                              setState(() {
                                _pointValue = double.parse(value.toStringAsFixed(1));
                              });
                            },
                          ),
                        ),
                        if (_selectedGameType == GameType.poker)
                          ListTile(
                            title: const Text('Initial Points'),
                            trailing: Text('$_initialPoints'),
                            subtitle: Slider(
                              value: _initialPoints.toDouble(),
                              min: 100,
                              max: 1000,
                              divisions: 9,
                              onChanged: (value) {
                                setState(() {
                                  _initialPoints = value.toInt();
                                });
                              },
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                ElevatedButton(
                  onPressed: state is GameLoading
                      ? null
                      : () {
                          final metadata = {
                            'maxPlayers': _maxPlayers,
                            'pointValue': _pointValue,
                            'initialPoints': _initialPoints,
                          };
                          context.read<GameBloc>().add(
                                CreateGameRequested(
                                  type: _selectedGameType,
                                  metadata: metadata,
                                ),
                              );
                        },
                  child: state is GameLoading
                      ? const CircularProgressIndicator()
                      : const Text('Create Game'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}