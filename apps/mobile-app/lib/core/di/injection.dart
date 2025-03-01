import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'package:poker_thirteen/core/di/injection.config.dart';

final GetIt getIt = GetIt.instance;

@InjectableInit(
  initializerName: 'init', // default
  preferRelativeImports: true, // default
  asExtension: false, // default
)
Future<void> configureDependencies() async => await init(getIt);