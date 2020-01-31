# React example

One practical use of this API is to create a country select field that fetches its options dynamically. Normally, you would need to install an npm package or create a file in your project containing the necessary data (normally country codes and names) and bundle that data with your app code. This results in a lot of extra kilobytes hanging around in your bundle for a feature that might not always get rendered or used. Here's a simple data size comparison:

- **50.1 KB** with the `countries` export from [Countries List](https://annexare.github.io/Countries/)
- **14.2 KB** with this API (~70% smaller)

This example uses [React](https://reactjs.org/) and [Apollo GraphQL](https://apollographql.com) tools. Apollo's GraphQL client and React components make it simple to execute, handle, and cache GraphQL queries. You can also accomplish this by sending a POST request to this API using `fetch` or your favourite request library, but this example won't cover that.

## Install dependencies

```shell
$ npm install react react-dom @apollo/client graphql
```

## Build the component

```js
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {ApolloClient, InMemoryCache, gql, useQuery} from '@apollo/client';

// initialize a GraphQL client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://countries.trevorblades.com'
});

// write a GraphQL query that asks for names and codes for all countries
const LIST_COUNTRIES = gql`
  {
    countries {
      name
      code
    }
  }
`;

// create a component that renders a select input for coutries
function CountrySelect() {
  const [country, setCountry] = useState('US');
  const {data, loading, error} = useQuery(LIST_COUNTRIES, {client});

  if (loading || error) {
    return <p>{error ? error.message : 'Loading...'}</p>;
  }

  return (
    <select value={country} onChange={event => setCountry(event.target.value)}>
      {data.countries.map(country => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
}

ReactDOM.render(<CountrySelect />, document.getElementById('root'));
```

## Now you're worldwide! 🌎

[![Edit Countries GraphQL API example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/913llyjylo)

Check out the CodeSandbox link above for a complete, working copy of this example. This `CountrySelect` component only fetches its country data when it mounts. That means that if it exists within an unmatched route or the falsey end of a condition, it doesn't request any data.

![Mr. Worldwide](./mr-worldwide.jpg)

> Reach for the stars, and if you don't grab 'em, at least you'll fall on top of the world
>
> &mdash; Pitbull
