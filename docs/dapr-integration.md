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

To run the application with Dapr:

1. Ensure Docker and Docker Compose are installed.
2. Run `docker-compose up` to start all services with their Dapr sidecars.

## Troubleshooting

If you encounter issues with Dapr:

1. Check the Dapr logs: `docker logs <container_name>`
2. Verify the Dapr components are correctly configured.
3. Ensure Redis is running and accessible.