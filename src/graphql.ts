import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export const yoga = createYoga({
  schema,
  batching: true,
});

export default {
  fetch: yoga.fetch,
};
