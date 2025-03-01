# Poker & Tiến Lên Game Management System

A microservices-based system for managing poker and Tiến Lên card games, featuring automatic scoring and financial management through a Telegram bot interface.

## Architecture

The system is built using NestJS and follows a microservices architecture with three main services:

1. **Telegram Bot Service** (Port 3001)

   - Handles user interactions through Telegram
   - Routes commands to appropriate services
   - Provides real-time game updates and financial reports

2. **Game Management Service** (Port 3002)

   - Manages game sessions
   - Handles player management
   - Processes game scoring

3. **Financial Management Service** (Port 3003)
   - Tracks player balances
   - Manages common fund
   - Generates financial reports

## Features

- Game Management

- Create new game sessions (Poker or Tiến Lên)
- Add players to games
- Automatic scoring system with point validation
- Game history tracking
- Score validation against player's current balance

- Financial Management
  - Automatic point-to-money conversion
  - Balance tracking per player
  - Common fund management
  - Financial reporting (daily/weekly/monthly)

## Setup Instructions

1. Prerequisites

   - Node.js (v18+)
   - Docker and Docker Compose
   - PostgreSQL
   - Telegram Bot Token

2. Environment Setup

   ```bash
   # Clone the repository
   git clone <repository-url>
   cd pocker-thirteen-microservice

   # Install dependencies
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. Development

   ```bash
   # Start individual services (without Dapr)
   npm run start:telegram-bot
   npm run start:game-management
   npm run start:financial-management
   
   # Or start all services together (without Dapr)
   npm run start:dev
   ```

   With Dapr:
   ```bash
   # Initialize Dapr (first time only)
   npm run dapr:init
   
   # Build common library
   npm run dapr:build:common
   
   # Start all services with Dapr
   npm run dapr:start:dev
   
   # Or start individual services with Dapr
   npm run dapr:start:telegram-bot
   npm run dapr:start:game-management
   npm run dapr:start:financial-management
   
   # Open Dapr dashboard
   npm run dapr:dashboard
   ```

4. Docker Deployment

   ```bash
   # Build and start all services
   npm run docker:up

   # Stop services
   npm run docker:down
   ```

## Dapr Integration

This project uses Dapr (Distributed Application Runtime) to enhance service-to-service communication and add resilience to the system.

### Key Benefits
- Simplified service-to-service communication
- Built-in resilience with automatic retries and circuit breaking
- State management for distributed applications
- Pub/sub messaging patterns for event-driven architecture

### Running with Dapr
For detailed instructions on running the application with Dapr, see the [Dapr Integration Guide](docs/dapr-integration.md).

Quick start with Docker Compose:
```bash
# Build and start all services with Dapr
docker-compose up --build
```

Quick start for local development:
```bash
# Initialize Dapr (first time only)
npm run dapr:init

# Build common library
npm run dapr:build:common

# Start all services with Dapr
npm run dapr:start:dev

# Open Dapr dashboard
npm run dapr:dashboard
```

## API Documentation

### Telegram Bot Commands

- `/start` - Initialize bot
- `/newgame [poker|tienlen]` - Create new game
- `/join [gameId]` - Join existing game
- `/score [points]` - Record score
- `/balance` - Check balance
- `/report [daily|weekly|monthly]` - View financial report

## Bot Setup Guide

Chi tiết về cách tạo và cấu hình bot Telegram [Hướng dẫn thiết lập Bot](docs/telegram-bot-setup.md).

## Database Schema

The system uses PostgreSQL with the following main entities:

- Game (game sessions)
- Player (user information)
- GameScore (game results)
- Transaction (financial records)
- Fund (common fund management)

## Testing & Coverage

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

Coverage reports will be generated in the `coverage` directory. You can view the detailed HTML report by opening `coverage/lcov-report/index.html` in your browser.

### Coverage Requirements

- Minimum overall coverage: 80%
- Branch coverage: 70%
- Function coverage: 85%
- Line coverage: 80%

To maintain code quality, please ensure your changes meet these coverage thresholds before submitting a pull request.

### Writing Tests

1. Unit Tests
   - Place test files next to the files being tested
   - Use naming convention: `*.spec.ts`
   - Focus on testing individual components and services

2. E2E Tests
   - Located in the `test` directory
   - Use naming convention: `*.e2e-spec.ts`
   - Test complete features and API endpoints

Example test structure:
```typescript
describe('SomeService', () => {
  let service: SomeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SomeService],
    }).compile();

    service = module.get(SomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Improvements & Future Development

### Mobile Application
- Developing a new Flutter-based mobile application service
- Providing native mobile experience for score recording
- Reducing dependency on Telegram platform
- Real-time game updates and notifications

### Technical Improvements
- ✅ Enhanced service communication with Dapr integration
- ✅ Improved resilience with automatic retries and circuit breaking
- ✅ Distributed state management with Redis
- Future: Enhanced observability with distributed tracing
- Future: Scaling and performance optimizations

### Reporting System
- Enhanced financial reporting capabilities
- Detailed game statistics and analytics
- Custom report generation
- Export functionality for reports

### Web3 Integration
- Smart contract development for game transactions
    - Player balances stored on blockchain
    - Automatic payouts using smart contracts
    - Transaction history on-chain
- Integration with popular wallets (MetaMask, WalletConnect)
- Support for multiple blockchains
    - Ethereum
    - Binance Smart Chain
    - Layer 2 solutions (Polygon, Arbitrum)
- NFT implementation
    - Special achievements as NFTs
    - Player rankings and statistics as NFTs
    - Exclusive game access tokens
- Token economy
    - Native game token for transactions
    - Staking and rewards system
    - Governance token for community decisions

## License

This project is licensed under the MIT License - see the LICENSE file for details.