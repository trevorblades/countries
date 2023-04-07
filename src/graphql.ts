import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export const yoga = createYoga({ schema });

export default {
  fetch: yoga.fetch,
};
