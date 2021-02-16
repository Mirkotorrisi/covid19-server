import redis, { RetryStrategyOptions } from "redis";
import config from "config";

const client = redis.createClient({
  url: String(config.get("redis_url")),
  retry_strategy: (options: RetryStrategyOptions) => {
    if (options.error && options.error.code === "ECONNREFUSED") {
      return new Error("The server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});
client.on("connect", () => {
  console.log("Redis Connected");
});

client.on("error", (err: string) => {
  console.log(err);
});

export default client;
