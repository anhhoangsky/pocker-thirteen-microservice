# Dapr Integration Guide

## Overview
This guide explains how we integrate Dapr (Distributed Application Runtime) into our microservices architecture to enhance service-to-service communication and add resilience to our system.

## Why Dapr?
- Simplified service-to-service communication
- Built-in service discovery
- Platform agnostic
- Support for multiple protocols (gRPC/HTTP)
- State management capabilities
- Pub/sub messaging patterns

## Architecture with Dapr
```ascii
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  Telegram Bot  │    │     Game       │    │   Financial    │
│    Service     │    │    Service     │    │    Service     │
├────────────────┤    ├────────────────┤    ├────────────────┤
│  Dapr Sidecar │◄─►│  Dapr Sidecar  │◄─►│  Dapr Sidecar  │
└────────────────┘    └────────────────┘    └────────────────┘
```

## Implementation Steps

1. Install Dapr CLI and initialize
```bash
# Install Dapr CLI
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Initialize Dapr
dapr init
```

2. Configure Service Communication
```yaml
# dapr/config.yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
	name: pocker-thirteen-config
spec:
	tracing:
		samplingRate: "1"
		zipkin:
			endpointAddress: http://localhost:9411/api/v2/spans
```

3. Define Service Components
```yaml
# dapr/components/pubsub.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
	name: pubsub
spec:
	type: pubsub.redis
	version: v1
	metadata:
	- name: redisHost
		value: localhost:6379
	- name: redisPassword
		value: ""
```

## Service Integration Examples

### Game Service
```typescript
// Using Dapr SDK
import { DaprClient } from '@dapr/dapr';

const client = new DaprClient();

// Publish game updates
await client.pubsub.publish('pubsub', 'game-updates', {
	gameId: 'game-123',
	action: 'SCORE_UPDATE',
	data: scoreData
});
```

### Financial Service
```typescript
// Subscribe to game updates
@DaprSubscribe({
	pubsubname: 'pubsub',
	topic: 'game-updates',
})
async handleGameUpdates(data: any) {
	// Process game updates
	await this.updatePlayerBalance(data);
}
```

## Benefits
1. **Resilience**: Automatic retries and circuit breaking
2. **Observability**: Built-in monitoring and tracing
3. **Scalability**: Easy horizontal scaling
4. **Maintainability**: Standardized communication patterns

## Future Enhancements
- Implement state management for game sessions
- Add distributed tracing
- Configure rate limiting
- Implement circuit breakers for failure handling