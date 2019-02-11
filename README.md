# Countries GraphQL API

[![Build Status](https://travis-ci.com/trevorblades/countries.svg?branch=master)](https://travis-ci.com/trevorblades/countries)
[![Donate](https://img.shields.io/beerpay/trevorblades/countries.svg)](https://beerpay.io/trevorblades/countries)


A public GraphQL API for information about countries, continents, and languages. This project uses [Countries List](https://annexare.github.io/Countries/) as a data source, so the schema follows the shape of that data, with a few exceptions:

1. The codes used to key the objects in the original data are available as a `code` property on each item returned from the API.
2. The `continent` and `languages` properties are now objects and arrays of objects, respectively.

## Writing queries

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

- **50.1 KB** with the `countries` export from [Countries List](https://annexare.github.io/Countries/)
- **14.2 KB** with this API (~70% smaller)

In this example, I'll be using [React](https://reactjs.org/) and some [Apollo](https://apollographql.com) tools. Apollo's GraphQL client and React components make it simple to execute, handle, and cache GraphQL queries. You can also accomplish this by sending a POST request to this API using `fetch` or your favourite request library, but I won't cover that in this example.

If you are prefer [React native](https://facebook.github.io/react-native/). Check out this [example](https://github.com/muhzi4u/country-directory-app).

### 1. Install dependencies

```shell
$ npm install react react-dom react-apollo apollo-boost graphql graphql-tag
```

### 2. Build a React component

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

ReactDOM.render(<CountrySelect />, document.getElementById('root'));
```

### 3. ???

### 4. Profit :tada:

![Country dropdown of the future](https://i.gyazo.com/89fc877623243bda314c555583102da6.gif)

Now you've got a slick, self-contained country select component that only fetches its data when it's mounted. That means that if it exists within an unmounted route or the falsey end of a condition, it doesn't request any data or take up any extra space in your bundle.

This is just one of many interesting things that you can build with this API. If you create something cool using this, let me know and I'll give you a shoutout here.
