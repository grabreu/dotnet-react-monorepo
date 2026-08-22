import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:5078/openapi/v1.json",
  output: "src/lib/api",
  plugins: [
    {
      name: "@tanstack/react-query",
    },
  ],
});
