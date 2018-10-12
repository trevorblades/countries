# Countries GraphQL API

[![Build Status](https://travis-ci.com/trevorblades/countries.svg?branch=master)](https://travis-ci.com/trevorblades/countries)

A public GraphQL API for data about countries, continents, and languages. This project uses [Countries list](https://annexare.github.io/Countries/) as a data source, so the schema follows the shape of that data, with a couple exceptions:

1. The codes used to key the objects in the original data are available as a `code` property on each item returned from the API.
2. The `continent` and `languages` properties are now objects and arrays of objects, respectively.

Check out the [playground](https://countries.trevorblades.com) to explore the schema and test out some queries.

## Example

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
