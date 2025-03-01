import { Injectable, Logger } from '@nestjs/common';
import { DaprClient, DaprServer } from 'dapr-client';

@Injectable()
export class DaprService {
  private readonly logger = new Logger(DaprService.name);
  private readonly client: DaprClient;
  private readonly server: DaprServer;

  constructor() {
    // Initialize Dapr client
    this.client = new DaprClient();
    this.server = new DaprServer();
    this.logger.log('Dapr service initialized');
  }

  /**
   * Publish a message to a topic
   * @param pubsubName The name of the pubsub component
   * @param topic The topic to publish to
   * @param data The data to publish
   */
  async publish<T>(pubsubName: string, topic: string, data: T): Promise<void> {
    try {
      await this.client.pubsub.publish(pubsubName, topic, data);
      this.logger.debug(`Published message to ${topic} topic`);
    } catch (error) {
      this.logger.error(`Error publishing message to ${topic} topic: ${error.message}`);
      throw error;
    }
  }

  /**
   * Subscribe to a topic
   * @param pubsubName The name of the pubsub component
   * @param topic The topic to subscribe to
   * @param callback The callback function to execute when a message is received
   */
  async subscribe<T>(
    pubsubName: string,
    topic: string,
    callback: (data: T) => Promise<void>,
  ): Promise<void> {
    try {
      await this.server.pubsub.subscribe(pubsubName, topic, callback);
      this.logger.debug(`Subscribed to ${topic} topic`);
    } catch (error) {
      this.logger.error(`Error subscribing to ${topic} topic: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save state
   * @param storeName The name of the state store component
   * @param key The key to save the state under
   * @param value The value to save
   */
  async saveState<T>(storeName: string, key: string, value: T): Promise<void> {
    try {
      await this.client.state.save(storeName, [
        {
          key,
          value,
        },
      ]);
      this.logger.debug(`Saved state for key ${key}`);
    } catch (error) {
      this.logger.error(`Error saving state for key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get state
   * @param storeName The name of the state store component
   * @param key The key to get the state for
   * @returns The state value
   */
  async getState<T>(storeName: string, key: string): Promise<T> {
    try {
      const state = await this.client.state.get<T>(storeName, key);
      this.logger.debug(`Retrieved state for key ${key}`);
      return state;
    } catch (error) {
      this.logger.error(`Error retrieving state for key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete state
   * @param storeName The name of the state store component
   * @param key The key to delete the state for
   */
  async deleteState(storeName: string, key: string): Promise<void> {
    try {
      await this.client.state.delete(storeName, key);
      this.logger.debug(`Deleted state for key ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting state for key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Invoke a service method
   * @param appId The ID of the application to invoke
   * @param methodName The name of the method to invoke
   * @param data The data to send with the invocation
   * @returns The response from the invocation
   */
  async invokeMethod<T, R>(appId: string, methodName: string, data: T): Promise<R> {
    try {
      const response = await this.client.invoker.invoke<T, R>(appId, methodName, data);
      this.logger.debug(`Invoked method ${methodName} on ${appId}`);
      return response;
    } catch (error) {
      this.logger.error(`Error invoking method ${methodName} on ${appId}: ${error.message}`);
      throw error;
    }
  }
}