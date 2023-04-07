import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export const yoga = createYoga({ schema });

self.addEventListener("fetch", yoga);
