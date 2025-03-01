# Dapr Integration

This document describes how Dapr (Distributed Application Runtime) has been integrated into our microservices architecture to enhance service-to-service communication and add resilience to our system.

## Overview

Dapr is a portable, event-driven runtime that makes it easy for developers to build resilient, microservice stateless and stateful applications that run on the cloud and edge. Dapr provides building blocks that simplify microservice development.

In our architecture, we've integrated Dapr to:

1. Enhance service-to-service communication
2. Add resilience to our system
3. Simplify state management
4. Enable pub/sub messaging patterns

## Components

We've configured the following Dapr components:

### Pub/Sub

We use Redis as our pub/sub broker to enable asynchronous communication between services. This is configured in `components/pubsub.yaml`.

### State Store

We use Redis as our state store to manage state across services. This is configured in `components/statestore.yaml`.

### Secrets Management

We use a local file-based secrets store to manage secrets. This is configured in `components/secrets.yaml`.

## Architecture

Our microservices architecture consists of the following services:

1. **Telegram Bot Service**: Acts as the entry point for user interactions via Telegram.
2. **Game Management Service**: Manages game state, players, and scores.
3. **Financial Management Service**: Manages financial transactions and reports.

Each service is deployed with a Dapr sidecar that handles communication, state management, and other cross-cutting concerns.

## Communication Patterns

### Service Invocation

Services can invoke methods on other services using Dapr's service invocation building block. This provides:

- Service discovery
- Retry policies
- Circuit breaking
- Observability

### Pub/Sub

Services can publish and subscribe to events using Dapr's pub/sub building block. This enables:

- Asynchronous communication
- Decoupling of services
- Event-driven architecture

## Resilience

Dapr adds resilience to our system through:

1. **Retries**: Automatically retries failed requests with configurable policies.
2. **Circuit Breaking**: Prevents cascading failures by stopping requests to failing services.
3. **Timeouts**: Configurable timeouts for service invocations.
4. **Fallbacks**: Services can implement fallback mechanisms when other services are unavailable.

## Implementation Details

### Common Dapr Service

We've created a common `DaprService` class that provides a unified interface for interacting with Dapr. This service is used by all microservices and provides methods for:

- Publishing and subscribing to events
- Saving and retrieving state
- Invoking methods on other services

### Service Integration

Each service has been updated to use Dapr for communication:

1. **Telegram Bot Service**: Uses Dapr to communicate with the Game Management and Financial Management services.
2. **Game Management Service**: Exposes its API through Dapr and uses Dapr for state management.
3. **Financial Management Service**: Exposes its API through Dapr and uses Dapr for state management.

## Docker Compose Configuration

Our Docker Compose configuration has been updated to include:

1. **Redis**: Used for pub/sub and state management.
2. **Dapr Placement Service**: Used for actor placement.
3. **Dapr Sidecars**: Each service has a Dapr sidecar configured with the appropriate components.

## Getting Started

### Prerequisites

Before running the application with Dapr, ensure you have the following installed:

1. **Docker and Docker Compose**: Required for containerized deployment
2. **Node.js**: Version 16 or higher
3. **npm**: For package management
4. **Dapr CLI**: For local development with Dapr

### Installing Dapr CLI

To install the Dapr CLI, follow these steps:

#### On Linux/macOS:
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```

#### On Windows (using PowerShell):
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

### Initializing Dapr

After installing the Dapr CLI, initialize Dapr on your local machine:

```bash
dapr init
```

This command sets up the Dapr runtime on your local environment, including:
- Installing the Dapr sidecar binaries
- Setting up default components (Redis for state store and pub/sub)
- Creating default configuration files

### Running with Docker Compose (Recommended for Production)

The easiest way to run the application with Dapr is using Docker Compose:

1. Clone the repository and navigate to the project directory
2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Edit the `.env` file to set your configuration values
4. Build and start the services:
   ```bash
   docker-compose up --build
   ```

This will start all services with their Dapr sidecars, Redis, and PostgreSQL.

### Running Locally for Development

For local development, you can run each service individually with Dapr:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the common library:
   ```bash
   cd apps/common
   npm run build
   cd ../..
   ```

3. Run each service with Dapr:

   #### Telegram Bot Service:
   ```bash
   dapr run --app-id telegram-bot --app-port 3001 --components-path ./components npm run start:dev telegram-bot
   ```

   #### Game Management Service:
   ```bash
   dapr run --app-id game-management --app-port 3002 --components-path ./components npm run start:dev game-management
   ```

   #### Financial Management Service:
   ```bash
   dapr run --app-id financial-management --app-port 3003 --components-path ./components npm run start:dev financial-management
   ```

### Verifying Dapr Integration

To verify that Dapr is working correctly:

1. Check that all services are running:
   ```bash
   docker ps  # If using Docker Compose
   # or
   dapr list  # If running locally with Dapr CLI
   ```

2. Check the Dapr dashboard:
   ```bash
   dapr dashboard
   ```

3. Test service communication by interacting with the Telegram Bot

## Troubleshooting

If you encounter issues with Dapr:

1. Check the Dapr logs: `docker logs <container_name>`
2. Verify the Dapr components are correctly configured.
3. Ensure Redis is running and accessible.

## Development with Dapr

### Debugging

When developing with Dapr, you can use the following techniques for debugging:

1. **Dapr Dashboard**: Access the Dapr dashboard to view components, configurations, and logs:
   ```bash
   dapr dashboard
   ```

2. **Dapr Logs**: View detailed logs for a specific Dapr instance:
   ```bash
   dapr logs -a <app-id>
   ```

3. **Component Validation**: Validate your Dapr components:
   ```bash
   dapr components --validate
   ```

### Testing with Dapr

For testing services with Dapr:

1. **Unit Testing**: Mock the Dapr client in your unit tests
2. **Integration Testing**: Use Dapr's testing utilities to create test environments

Example of mocking Dapr client in a test:

```typescript
// Mock DaprService
const mockDaprService = {
  publish: jest.fn(),
  getState: jest.fn(),
  saveState: jest.fn(),
  invokeMethod: jest.fn(),
};

// In your test
describe('YourService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should publish message', async () => {
    // Setup
    mockDaprService.publish.mockResolvedValue(undefined);
    
    // Test
    await yourService.someMethod();
    
    // Assert
    expect(mockDaprService.publish).toHaveBeenCalledWith(
      'pubsub',
      'your-topic',
      expect.any(Object)
    );
  });
});
```