# Poker Thirteen Mobile App

A Flutter mobile application for Poker Thirteen game management that provides a native mobile experience for managing games, recording scores, and tracking finances.

## Features

- User authentication
- Game creation and management
- Score recording and tracking
- Financial balance viewing
- Real-time updates

## Prerequisites

Before you begin, ensure you have the following installed:

- [Flutter SDK](https://flutter.dev/docs/get-started/install) (version 2.19.0 or higher)
- [Dart SDK](https://dart.dev/get-dart) (included with Flutter)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)
- [VS Code](https://code.visualstudio.com/) (optional, but recommended)
- [Git](https://git-scm.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pocker-thirteen-microservice
```

### 2. Install Dependencies

Navigate to the mobile app directory:

```bash
cd apps/mobile-app
flutter pub get
```

### 3. Generate Required Files

The app uses code generation for dependency injection, routing, and JSON serialization. Run the following command to generate the necessary files:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 4. Configure API Endpoint

Open the file `lib/core/network/api_client.dart` and update the base URL to point to your API server:

```dart
_dio.options.baseUrl = 'http://your-api-server:3000/mobile-api';
```

### 5. Run the App

#### Development Mode

```bash
flutter run
```

This will launch the app on a connected device or emulator.

#### Choose a Specific Device

If you have multiple devices connected:

```bash
flutter devices
flutter run -d <device-id>
```

### 6. Building for Production

#### Android

```bash
flutter build apk --release
```

The APK file will be available at `build/app/outputs/flutter-apk/app-release.apk`.

For an Android App Bundle (recommended for Play Store):

```bash
flutter build appbundle --release
```

#### iOS (macOS only)

```bash
flutter build ios --release
```

Then open the Xcode project in `ios/Runner.xcworkspace` and archive it for distribution.

## Project Structure

The app follows a clean architecture approach with the following structure:

- `lib/core/` - Core functionality like networking, storage, and dependency injection
- `lib/features/` - Feature modules (auth, game, financial)
  - Each feature has its own `data`, `domain`, and `presentation` layers
- `lib/routes/` - App routing configuration

## Troubleshooting

### Common Issues

1. **Build failures after updating dependencies**:
   ```bash
   flutter clean
   flutter pub get
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

2. **API connection issues**:
   - Ensure the API server is running
   - Check that the base URL in `api_client.dart` is correct
   - If running on an emulator, use `10.0.2.2` instead of `localhost`

3. **iOS build issues**:
   - Ensure you have the latest Xcode version
   - Run `pod install` in the `ios` directory

## Contributing

Please read the [CONTRIBUTING.md](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.