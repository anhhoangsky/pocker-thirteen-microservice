# Mobile App Setup Guide

This guide provides detailed instructions for setting up and running the Poker Thirteen mobile application.

## Overview

The Poker Thirteen mobile app is built with Flutter and follows a clean architecture approach with BLoC pattern for state management. It provides a native mobile experience for managing poker and Tiến Lên card games, viewing financial information, and tracking game scores.

## System Requirements

- **Flutter SDK**: Version 2.19.0 or higher
- **Dart SDK**: Included with Flutter installation
- **IDE**: Android Studio, VS Code, or IntelliJ IDEA with Flutter plugins
- **For Android Development**:
  - Android Studio
  - Android SDK
  - Android Emulator or physical device
- **For iOS Development** (macOS only):
  - Xcode 13 or higher
  - iOS Simulator or physical device
  - CocoaPods

## Installation Steps

### 1. Install Flutter SDK

Follow the official Flutter installation guide for your operating system:
- [Windows](https://flutter.dev/docs/get-started/install/windows)
- [macOS](https://flutter.dev/docs/get-started/install/macos)
- [Linux](https://flutter.dev/docs/get-started/install/linux)

Verify your installation by running:

```bash
flutter doctor
```

Address any issues reported by the Flutter doctor command before proceeding.

### 2. IDE Setup

#### VS Code
1. Install the [Flutter extension](https://marketplace.visualstudio.com/items?itemName=Dart-Code.flutter)
2. Install the [Dart extension](https://marketplace.visualstudio.com/items?itemName=Dart-Code.dart-code)

#### Android Studio
1. Install the [Flutter plugin](https://plugins.jetbrains.com/plugin/9212-flutter)
2. Install the [Dart plugin](https://plugins.jetbrains.com/plugin/6351-dart)

### 3. Clone the Repository

```bash
git clone <repository-url>
cd pocker-thirteen-microservice
```

### 4. Install Dependencies

Navigate to the mobile app directory:

```bash
cd apps/mobile-app
flutter pub get
```

### 5. Code Generation

The app uses several code generation libraries:
- `json_serializable` for JSON serialization
- `injectable` for dependency injection
- `auto_route` for navigation

Run the build_runner to generate the necessary files:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## Configuration

### API Configuration

The mobile app connects to the backend API service. Configure the API endpoint in `lib/core/network/api_client.dart`:

```dart
_dio.options.baseUrl = 'http://your-api-server:3000/mobile-api';
```

- For local development with an emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, use the IP address of your development machine
- For production, use your production API endpoint

### Environment Configuration

Create different environment configurations for development, staging, and production by using Flutter's flavor system:

1. Create a `.env.dev`, `.env.staging`, and `.env.prod` file in the root of the mobile app directory
2. Use the [flutter_dotenv](https://pub.dev/packages/flutter_dotenv) package to load environment variables

## Running the App

### Development Mode

```bash
flutter run
```

### With Specific Environment

```bash
flutter run --flavor dev
flutter run --flavor staging
flutter run --flavor prod
```

### On Specific Device

List available devices:

```bash
flutter devices
```

Run on a specific device:

```bash
flutter run -d <device-id>
```

## Building for Production

### Android

#### Generate Keystore (First time only)

```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

#### Configure Signing

Create a file `android/key.properties` with the following content:

```
storePassword=<password>
keyPassword=<password>
keyAlias=upload
storeFile=<path-to-keystore>/upload-keystore.jks
```

#### Build APK

```bash
flutter build apk --release
```

#### Build App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

### iOS (macOS only)

#### Configure Signing

1. Open the Xcode project:
   ```bash
   open ios/Runner.xcworkspace
   ```
2. Select the Runner project in the left sidebar
3. Select the Runner target
4. Go to the Signing & Capabilities tab
5. Select your team and configure signing

#### Build IPA

```bash
flutter build ios --release
```

Then archive and distribute using Xcode.

## Troubleshooting

### Common Issues

#### Build Failures

If you encounter build failures after updating dependencies:

```bash
flutter clean
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

#### iOS Pod Install Issues

If you encounter issues with CocoaPods:

```bash
cd ios
pod deintegrate
pod setup
pod install
```

#### Android Gradle Issues

If you encounter Gradle issues:

```bash
cd android
./gradlew clean
```

#### API Connection Issues

- Ensure the API server is running
- Check that the base URL in `api_client.dart` is correct
- If running on an emulator, use `10.0.2.2` instead of `localhost`

## Architecture Overview

The app follows a clean architecture approach with three main layers:

1. **Presentation Layer**
   - BLoC for state management
   - UI components and pages
   - Navigation using auto_route

2. **Domain Layer**
   - Business logic
   - Entity models
   - Repository interfaces

3. **Data Layer**
   - Repository implementations
   - Data sources (API, local storage)
   - DTOs and mappers

### Key Components

- **Dependency Injection**: Using `get_it` and `injectable`
- **State Management**: Using `flutter_bloc`
- **Navigation**: Using `auto_route`
- **API Communication**: Using `dio`
- **Local Storage**: Using `flutter_secure_storage` for tokens and sensitive data

## Feature Overview

### Authentication

- Login with user ID and username
- Token-based authentication
- Secure token storage

### Game Management

- Create new games (Poker or Tiến Lên)
- Join existing games
- Record scores
- View game history and statistics

### Financial Management

- View current balance
- View financial reports
- Track transaction history

## Contributing

Please read the [CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.