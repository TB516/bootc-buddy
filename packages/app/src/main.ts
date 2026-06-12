import type { ServiceInfo } from "@bootc-buddy/shared-types";

const service: ServiceInfo = {
  name: "app",
  runtime: "deno",
};

console.log(`Hello from ${service.name} running on ${service.runtime}!`);
