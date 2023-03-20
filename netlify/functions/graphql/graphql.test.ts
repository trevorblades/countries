import assert from "node:assert";
import { server } from "./graphql";

it("returns filtered data", async () => {
  const query = /* GraphQL */ `
    query ListFilteredCountries($filter: CountryFilterInput) {
      countries(filter: $filter) {
        name
        code
      }
    }
  `;

  const response = await server.executeOperation({
    query,
    variables: {
      filter: {
        code: {
          in: ["US", "CA"],
        },
      },
    },
  });

  assert(response.body.kind === "single");
  expect(response.body.singleResult.errors).toBeUndefined();
  expect(response.body.singleResult.data?.countries).toHaveLength(2);
});
