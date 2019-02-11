# Countries GraphQL API

[![Build Status](https://travis-ci.com/trevorblades/countries.svg?branch=master)](https://travis-ci.com/trevorblades/countries)
[![Donate](https://img.shields.io/beerpay/trevorblades/countries.svg)](https://beerpay.io/trevorblades/countries)


A public GraphQL API for information about countries, continents, and languages. This project uses [Countries List](https://annexare.github.io/Countries/) as a data source, so the schema follows the shape of that data, with a few exceptions:

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

## Example

One practical use of this API is to create a country select field that fetches its options dynamically. Normally, you would need to install an npm package or create a file in your project containing the necessary data (normally country codes and names) and bundle that data with your app code. This results in a lot of extra kilobytes hanging around in your bundle for a feature that might not always get rendered or used. Here's a simple data size comparison:

- **50.1 KB** with the `countries` export from [Countries List](https://annexare.github.io/Countries/)
- **14.2 KB** with this API (~70% smaller)

This example uses [React](https://reactjs.org/) and [Apollo GraphQL](https://apollographql.com) tools. Apollo's GraphQL client and React components make it simple to execute, handle, and cache GraphQL queries. You can also accomplish this by sending a POST request to this API using `fetch` or your favourite request library, but this example won't cover that.

If you prefer [React native](https://facebook.github.io/react-native/), check out [this example](https://github.com/muhzi4u/country-directory-app).

### Install dependencies

```shell
$ npm install react react-dom react-apollo apollo-boost graphql graphql-tag
```

### Build the component

```js
import ApolloClient from 'apollo-boost';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import gql from 'graphql-tag';
import {Query} from 'react-apollo';

// initialize a GraphQL client
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

// create a component that renders an API data-powered select input
class CountrySelect extends Component {
  state = {
    country: 'US'
  };

  // set the selected country to the new input value
  onCountryChange = event => {
    this.setState({country: event.target.value});
  };

  render() {
    return (
      <Query query={GET_COUNTRIES} client={client}>
        {({loading, error, data}) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>{error.message}</p>;
          return (
            <select value={this.state.country} onChange={this.onCountryChange}>
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

ReactDOM.render(<CountrySelect />, document.getElementById('root'));
```

### Now you're worldwide! 🌎

[![Edit Countries GraphQL API example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/913llyjylo)

Check out the CodeSandbox link above for a complete, working copy of this example. This `CountrySelect` component only fetches its country data when it mounts. That means that if it exists within an unmatched route or the falsey end of a condition, it doesn't request any data.

![Mr. Worldwide](https://raw.githubusercontent.com/trevorblades/countries/master/mr-worldwide.jpg)

> Reach for the stars, and if you don't grab 'em, at least you'll fall on top of the world
>
> &mdash; Pitbull
