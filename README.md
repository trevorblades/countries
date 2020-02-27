<img align="right" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/155/earth-globe-americas_1f30e.png" alt="globe" width="120">

# Countries GraphQL API

[![Build Status](https://github.com/trevorblades/countries/workflows/Node%20CI/badge.svg)](https://github.com/trevorblades/countries/actions)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)

A public GraphQL API for information about countries, continents, and languages. This project uses [Countries List](https://annexare.github.io/Countries/) and [`provinces`](https://github.com/substack/provinces) as data sources, so the schema follows the shape of that data, with a few exceptions:

1. The codes used to key the objects in the original data are available as a `code` property on each item returned from the API.
2. The `continent` and `languages` properties are now objects and arrays of objects, respectively.
3. Each `Country` has an array of `states` populated by their states/provinces, if any.

## Writing queries

```graphql
{
  country(code: "BR") {
    name
    native
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

## Examples

- [React](./examples/react)
- [React Native](https://github.com/muhzi4u/country-directory-app)
- [ReasonML](https://medium.com/@idkjs/reasonml-and-graphql-without-graphql-part-1-192c2e9e349c)
- [Country quiz app](https://github.com/byrichardpowell/Country-Quiz) (React, TypeScript)
- [Python](./examples/python)

## License

[MIT](./LICENSE)
