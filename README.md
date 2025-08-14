<p align="center">
  <img src="./logo.png" alt="globe" width="150">
</p>

<h1 align="center">Countries GraphQL API</h1>

<div align="center">

[![Build Status](https://github.com/trevorblades/countries/workflows/Node%20CI/badge.svg)](https://github.com/trevorblades/countries/actions)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![Twitter Follow](https://img.shields.io/twitter/follow/trevorblades?style=social)](https://twitter.com/trevorblades)

</div>

A public GraphQL API for information about countries, continents, and languages. This project uses [Countries List](https://annexare.github.io/Countries/) and [`provinces`](https://www.npmjs.com/package/provinces) as data sources, so the schema follows the shape of that data, with a few exceptions:

1. The codes used to key the objects in the original data are available as a `code` property on each item returned from the API.
1. The `Country.continent` and `Country.languages` are now objects and arrays of objects, respectively.
1. The `Country.currency` and `Country.phone` fields _sometimes_ return a comma-separated list of values. For this reason, this API also exposes `currencies` and `phones` fields that are arrays of all currencies and phone codes for a country.
1. Each `Country` has an array of `states` populated by their states/provinces, if any.
1. Each `Country` also has an `awsRegion` field that shows its nearest AWS region, powered by [`country-to-aws-region`](https://github.com/Zeryther/country-to-aws-region).

## Writing queries

```graphql
query GetCountry {
  country(code: "BR") {
    name
    native
    capital
    emoji
    currency
    languages {
      code
      name
    }
  }
}
```

The above GraphQL query will produce the following JSON response:

```json
{
  "data": {
    "country": {
      "name": "Brazil",
      "native": "Brasil",
      "capital": "Brasília",
      "emoji": "🇧🇷",
      "currency": "BRL",
      "languages": [
        {
          "code": "pt",
          "name": "Portuguese"
        }
      ]
    }
  }
}
```

Check out [the playground](https://countries.trevorblades.com) to explore the schema and test out some queries.

## Filtering

The `countries`, `continents`, and `languages` top-level `Query` fields accept an optional `filter` argument that causes results to be filtered on one or more subfields. The `continents` and `languages` fields can be filtered by their `code`, while `countries` can be filtered by `code`, `currency`, or `continent`.

> Note: The `continent` filter on the `Query.countries` field must be the continent code, i.e. "SA" for South America.

The filtering logic is powered by [sift](https://github.com/crcn/sift.js) and this API supports the following operators: `eq`, `ne`, `in`, `nin`, and `regex`. To learn more about these operators and how they work, check out [the sift docs](https://github.com/crcn/sift.js#supported-operators).

Here are some examples of filtering that you can copy and paste into [the playground](https://countries.trevorblades.com) to try for yourself:

```graphql
query ListCountriesThatUseUSD {
  countries(filter: { currency: { eq: "USD" } }) {
    code
    name
  }
}

query ListCountriesInCUSMA {
  countries(filter: { code: { in: ["US", "CA", "MX"] } }) {
    code
    name
    languages {
      name
    }
  }
}

query ListCountriesThatBeginWithTheLetterA {
  countries(filter: { name: { regex: "^A" } }) {
    code
    name
    currency
  }
}
```

## Examples

- [React](./examples/react)
- [React Native](https://github.com/muhzi4u/country-directory-app)
- [ReasonML](https://medium.com/@idkjs/reasonml-and-graphql-without-graphql-part-1-192c2e9e349c)
- [Country quiz app](https://github.com/byrichardpowell/Country-Quiz) (React, TypeScript)
- [Python](./examples/python)
- [Seed](https://github.com/seed-rs/seed/tree/master/examples/graphql)
- [Country Searcher](https://github.com/FranP-code/country-searcher)

## License

[MIT](./LICENSE)

[![Powered by Stellate, the GraphQL API Management platform](https://stellate.co/badge.svg)](https://stellate.co/?ref=powered-by)
