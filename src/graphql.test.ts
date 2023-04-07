import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { countries } from "countries-list";
import { parse } from "graphql";
import { yoga } from "./graphql";

const executor = buildHTTPExecutor({
  fetch: yoga.fetch,
});

const query = parse(/* GraphQL */ `
  query ListFilteredCountries($filter: CountryFilterInput) {
    countries(filter: $filter) {
      name
      code
    }
  }
`);

function assertSingleValue<TValue extends object>(
  value: TValue | AsyncIterable<TValue>
): asserts value is TValue {
  if (Symbol.asyncIterator in value) {
    throw new Error("Expected single value");
  }
}

it("returns filtered data", async () => {
  const result = await executor({
    document: query,
    variables: {
      filter: {
        code: {
          in: ["US", "CA"],
        },
      },
    },
  });

  assertSingleValue(result);

  expect(result.data?.countries).toHaveLength(2);
});

it("filters a single value", async () => {
  const result = await executor({
    document: query,
    variables: {
      filter: {
        code: {
          eq: "US",
        },
      },
    },
  });

  assertSingleValue(result);

  expect(result.data?.countries).toHaveLength(1);
});

it("returns all data if no filter is provided", async () => {
  const result = await executor({ document: query });

  assertSingleValue(result);

  expect(result.data?.countries).toHaveLength(Object.keys(countries).length);
});
