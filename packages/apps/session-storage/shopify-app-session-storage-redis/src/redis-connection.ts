import {createClient, RedisClientOptions} from 'redis';
import {DBConnection} from '@shopify/shopify-app-session-storage';

type RedisClient = ReturnType<typeof createClient>;

export class RedisConnection implements DBConnection {
  sessionStorageIdentifier: string;
  private client: RedisClient;

  constructor(
    urlOrClient: string | URL | RedisClient,
    options: RedisClientOptions,
    keyPrefix: string,
  ) {
    this.init(urlOrClient, options);
    this.sessionStorageIdentifier = keyPrefix;
  }

  query(_query: string, _params: any[]): Promise<any[]> {
    throw new Error('Method not implemented. Use get(string, boolean) instead');
  }

  async connect(): Promise<void> {
    if (!this.client.isReady) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async keys(name: string): Promise<any> {
    return this.client.keys(name);
  }

  async set(baseKey: string, value: any, addKeyPrefix = true) {
    await this.client.set(this.buildKey(baseKey, addKeyPrefix), value);
  }

  async del(baseKey: string, addKeyPrefix = true): Promise<any> {
    return this.client.del(this.buildKey(baseKey, addKeyPrefix));
  }

  async get(baseKey: string, addKeyPrefix = true): Promise<any> {
    return this.client.get(this.buildKey(baseKey, addKeyPrefix));
  }

  generateFullKey(name: string): string {
    return `${this.sessionStorageIdentifier}_${name}`;
  }

  private buildKey(baseKey: string, addKeyPrefix: boolean): string {
    return addKeyPrefix ? this.generateFullKey(baseKey) : baseKey;
  }

  private init(
    urlOrClient: string | URL | RedisClient,
    options: RedisClientOptions,
  ) {
    if (typeof urlOrClient === 'string' || urlOrClient instanceof URL) {
      this.client = createClient({...options, url: urlOrClient.toString()});
      this.client.on('error', this.eventHandler);
      this.client.on('connect', this.eventHandler);
      this.client.on('reconnecting', this.eventHandler);
      this.client.on('ready', this.eventHandler);
    } else {
      this.client = urlOrClient;
    }
  }

  private eventHandler = (..._args: any[]) => {};
}
