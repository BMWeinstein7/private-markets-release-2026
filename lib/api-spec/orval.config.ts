import { defineConfig } from "orval";
import path from "path";

const apiClientReactSrc = path.resolve(
  __dirname,
  "..",
  "api-client-react",
  "src",
);
const apiZodSrc = path.resolve(__dirname, "..", "api-zod", "src");
const specPath = path.resolve(__dirname, "openapi.yaml");

export default defineConfig({
  "api-client-react": {
    input: {
      target: specPath,
    },
    output: {
      workspace: apiClientReactSrc,
      target: "generated",
      client: "react-query",
      mode: "split",
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: path.resolve(apiClientReactSrc, "custom-fetch.ts"),
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: {
      target: specPath,
    },
    output: {
      workspace: apiZodSrc,
      client: "zod",
      target: "generated",
      schemas: { path: "generated/types", type: "typescript" },
      mode: "split",
      clean: true,
      prettier: true,
      override: {
        zod: {
          coerce: {
            query: ["boolean", "number", "string"],
            param: ["boolean", "number", "string"],
          },
        },
        useDates: true,
      },
    },
  },
});
