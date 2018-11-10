# Countries GraphQL API

[![Build Status](https://travis-ci.com/trevorblades/countries.svg?branch=master)](https://travis-ci.com/trevorblades/countries)
[![Donate](https://img.shields.io/beerpay/trevorblades/countries.svg)](https://beerpay.io/trevorblades/countries)


A public GraphQL API for information about countries, continents, and languages. This project uses [Countries List](https://annexare.github.io/Countries/) as a data source, so the schema follows the shape of that data, with a few exceptions:

1. The codes used to key the objects in the original data are available as a `code` property on each item returned from the API.
2. The `continent` and `languages` properties are now objects and arrays of objects, respectively.

## Querying

In:

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

Out:

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

## Example

One practical use of this API is to create a country select field that fetches its options dynamically. Normally, you would need to install an npm package or create a file in your project containing the necessary data -- usually country codes and names -- and bundle that data with your app code. This results in a lot of extra kilobytes hanging around in your bundle for a feature that might not always get rendered or used. Here's what that data size looks like:

- **50.1 KB** using the `countries` export from [Countries List](https://annexare.github.io/Countries/)
- **14.2 KB** using this API (~70% smaller)

In this example, I'll be using [React](https://reactjs.org/) and some [Apollo](https://apollographql.com) tools. Apollo's GraphQL client and React components make it simple to execute, handle, and cache GraphQL queries. You can also accomplish this by sending a POST request to this API using `fetch` or your favourite request library, but I won't cover that in this example.

### Install dependencies

```shell
$ npm install react react-dom react-apollo apollo-boost graphql graphql-tag
```

### Build a React component

```js
import ApolloClient from 'apollo-boost';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import gql from 'graphql-tag';
import {Query} from 'react-apollo';

// initialize our Apollo GraphQL client
const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com'
});

// write a GraphQL query that asks for names and codes for all countries
const GET_COUNTRIES = gql`
  {
    countries {
      name
      code
    }
  }
`;

class App extends Component {
  constructor(props) {
    super(props);

    // set a default value
    this.state = {
      country: 'US'
    };
  }
  
  // set the selected country to the new input value
  onCountryChange(event) {
    this.setState({country: event.target.value});
  }

  render() {
    return (
      <Query query={GET_COUNTRIES} client={client}>
        {({loading, error, data}) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>{error.message}</p>;
          return (
            <select
              value={this.state.country}
              onChange={this.onCountryChange.bind(this)}
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
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
```

### Behold, your mighty country select 🎉
