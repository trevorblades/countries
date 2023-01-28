import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./netlify/functions/graphql/schema.graphqls",
  generates: {
    "./netlify/functions/graphql/resolvers-types.ts": {
      config: {
        useIndexSignature: true,
        defaultMapper: "Partial<{T}>",
      },
      plugins: ["typescript", "typescript-resolvers"],
    },
  },
};

export default config;
