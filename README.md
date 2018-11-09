# Countries GraphQL API

[![Build Status](https://travis-ci.com/trevorblades/countries.svg?branch=master)](https://travis-ci.com/trevorblades/countries)
[![Donate](https://img.shields.io/beerpay/trevorblades/countries.svg)](https://beerpay.io/trevorblades/countries)


A public GraphQL API for information about countries, continents, and languages. This project uses [Countries List](https://annexare.github.io/Countries/) as a data source, so the schema follows the shape of that data, with a couple exceptions:

1. The codes used to key the objects in the original data are available as a `code` property on each item returned from the API.
2. The `continent` and `languages` properties are now objects and arrays of objects, respectively.

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

Check out the [playground](https://countries.trevorblades.com) to explore the schema and test out some queries.

## Example

A practical use of this API is to create a country select input that doesn't require you to include a large dataset of country info in your bundle.

In this example, we'll be using [React](https://reactjs.org/) and the [Apollo](https://apollographql.com) GraphQL client. First, we'll install all of our dependencies:

```shell
$ npm install react react-dom react-apollo apollo-boost graphql graphql-tag
```

50.1 KB with `countries-list`
14.2 KB with Countries GraphQL

```js
import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com'
});

const GET_COUNTRIES = gql`
  {
    countries {
      name
      code
    }
  }
`;

class App extends Component {
  state = {
    country: ''
  };

  onCountryChange = event =>
    this.setState({country: event.target.value});

  render() {
    return (
      <ApolloProvider client={client}>
        <Query query={GET_COUNTRIES}>
          {({loading, error, data}) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>{error.message}</p>;
            return (
              <select
                value={this.state.country}
                onChange={this.onCountryChange}
              >
                {data.countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            );
          }}
        </Query>
      </ApolloProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
```
