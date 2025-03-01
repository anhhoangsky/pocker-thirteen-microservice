import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:poker_thirteen/features/game/presentation/bloc/game_bloc.dart';

@RoutePage()
class RecordScorePage extends StatefulWidget {
  const RecordScorePage({Key? key}) : super(key: key);

  @override
  State<RecordScorePage> createState() => _RecordScorePageState();
}

class _RecordScorePageState extends State<RecordScorePage> {
  final _formKey = GlobalKey<FormState>();
  final _pointsController = TextEditingController();
  int? _rank;

  @override
  void dispose() {
    _pointsController.dispose();
    super.dispose();
  }

  void _recordScore() {
    if (_formKey.currentState!.validate()) {
      final points = double.parse(_pointsController.text);
      context.read<GameBloc>().add(
            RecordScoreRequested(
              points: points,
              rank: _rank,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Record Score'),
      ),
      body: BlocConsumer<GameBloc, GameState>(
        listener: (context, state) {
          if (state is ScoreRecorded) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Score recorded successfully!')),
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
            child: Form(
              key: _formKey,
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
                            'Score Details',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _pointsController,
                            decoration: const InputDecoration(
                              labelText: 'Points',
                              hintText: 'Enter points (positive or negative)',
                            ),
                            keyboardType: TextInputType.numberWithOptions(
                              decimal: true,
                              signed: true,
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter points';
                              }
                              if (double.tryParse(value) == null) {
                                return 'Please enter a valid number';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          const Text('Rank (Optional for Tiến Lên):'),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8.0,
                            children: List.generate(4, (index) {
                              final rank = index + 1;
                              return ChoiceChip(
                                label: Text('$rank'),
                                selected: _rank == rank,
                                onSelected: (selected) {
                                  setState(() {
                                    _rank = selected ? rank : null;
                                  });
                                },
                              );
                            }),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: state is GameLoading ? null : _recordScore,
                    child: state is GameLoading
                        ? const CircularProgressIndicator()
                        : const Text('Record Score'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}