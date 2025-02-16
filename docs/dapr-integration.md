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
  data: scoreData,
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

| Tiêu chí                   | @nestjs/microservices (Transport.TCP)                                                              | Dapr (Distributed Application Runtime)                                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Giao thức truyền thông** | Sử dụng giao thức TCP trực tiếp qua socket                                                         | Sử dụng HTTP hoặc gRPC qua sidecar                                                                                                                                                                 |
| **Tích hợp ứng dụng**      | Tích hợp trực tiếp trong hệ sinh thái NestJS; dễ dàng sử dụng trong Node.js                        | Độc lập về ngôn ngữ; có thể tích hợp với nhiều framework và ngôn ngữ khác nhau                                                                                                                     |
| **Triển khai**             | Đơn giản, triển khai trực tiếp trên Node.js hoặc server đơn lẻ                                     | Triển khai dưới dạng sidecar kèm theo ứng dụng; phù hợp với môi trường Kubernetes và cloud-native                                                                                                  |
| **Tính năng hỗ trợ**       | Hỗ trợ mô hình RPC (request-response) cơ bản; cần tự cấu hình các cơ chế như retry, load balancing | Cung cấp các building block đa dạng: service invocation, state management, pub/sub messaging, bindings, secret management và hỗ trợ tích hợp sẵn các cơ chế retry, load balancing, circuit breaker |
| **Độ tin cậy & mở rộng**   | Phụ thuộc vào cấu hình TCP truyền thống; cần tự xây dựng thêm các cơ chế mở rộng và xử lý lỗi      | Được thiết kế cho hệ thống phân tán; các tính năng mở rộng và độ tin cậy được tích hợp sẵn qua sidecar                                                                                             |
| **Giám sát & Quan sát**    | Cần tích hợp thêm các giải pháp bên ngoài (ví dụ: Prometheus, Grafana)                             | Hỗ trợ tích hợp sẵn với OpenTelemetry, logs, metrics, giúp việc theo dõi trở nên dễ dàng hơn                                                                                                       |
| **Bảo mật**                | Yêu cầu tự cấu hình bảo mật giao tiếp (SSL/TLS, xác thực,...)                                      | Cung cấp các tính năng quản lý bí mật và bảo mật thông qua API, tích hợp với hệ thống bảo mật của cloud                                                                                            |
| **Độ phức tạp & Học hỏi**  | Dễ dàng nếu bạn đã quen với NestJS; cấu hình và triển khai đơn giản                                | Có thêm bước cấu hình sidecar và làm quen với các building block mới, học hỏi thêm về mô hình cloud-native                                                                                         |

## Future Enhancements

- Implement state management for game sessions
- Add distributed tracing
- Configure rate limiting
- Implement circuit breakers for failure handling
