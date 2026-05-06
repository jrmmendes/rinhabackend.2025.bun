import { RedisClient } from "bun";

export class CacheClient {
  private client: RedisClient;

  constructor() {
    this.client = new RedisClient("redis://redis:6379");
  }

  async set<T = unknown>(key: string, value: T, ttl?: number) {
    this.client.set(key, JSON.stringify(value));
    if (ttl) {
      this.client.expire(key, ttl);
    }
  }

  async get<T = number | string | boolean>(key: string) {
    return <T>this.client.get(key);
  }

  async getAll(pattern: string, filters?: Partial<{ from: number; to: number }>) {
    const keys = await this.client.keys(pattern);
    console.log({ from: filters?.from, to: filters?.to });
    console.log(pattern)

    return Promise.all(keys.map((key) => this.client.get(key))).then(
      (keyValues) => {
        return keyValues.filter((value) => {
          const timestamp = value?.split(":")[1] as string;
        if (!filters?.from || !filters?.to) return value;
          if (!timestamp) return value;
          return Number(timestamp) > filters.from && Number(timestamp) < filters.to;
        });
      },
    );
  }

  async removeAll(pattern: string) {
    const keys = await this.client.keys(pattern);
    return Promise.all(keys.map((key) => this.client.del(key)));
  }
}
