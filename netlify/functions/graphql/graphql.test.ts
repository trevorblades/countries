import assert from "node:assert";
import { countries } from "countries-list";
import { server } from "./graphql";

const query = /* GraphQL */ `
  query ListFilteredCountries($filter: CountryFilterInput) {
    countries(filter: $filter) {
      name
      code
    }
  }
`;

it("returns filtered data", async () => {
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

it("filters a single value", async () => {
  const response = await server.executeOperation({
    query,
    variables: {
      filter: {
        code: {
          eq: "US",
        },
      },
    },
  });

  assert(response.body.kind === "single");
  expect(response.body.singleResult.errors).toBeUndefined();
  expect(response.body.singleResult.data?.countries).toHaveLength(1);
});

it("returns all data if no filter is provided", async () => {
  const response = await server.executeOperation({ query });

  assert(response.body.kind === "single");
  expect(response.body.singleResult.errors).toBeUndefined();
  expect(response.body.singleResult.data?.countries).toHaveLength(
    Object.keys(countries).length
  );
});
