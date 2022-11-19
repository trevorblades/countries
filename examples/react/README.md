# React example

One practical use of this API is to create a country select field that fetches its options dynamically. Normally, you would need to install an npm package or create a file in your project containing the necessary data (normally country codes and names) and bundle that data with your app code. This results in a lot of extra kilobytes hanging around in your bundle for a feature that might not always get rendered or used. Here's a simple data size comparison:

- **50.1 KB** with the `countries` export from [Countries List](https://annexare.github.io/Countries/)
- **14.2 KB** with this API (~70% smaller)

This example uses [React](https://reactjs.org/) and [Apollo GraphQL](https://apollographql.com) tools. Apollo's GraphQL client and React components make it simple to execute, handle, and cache GraphQL queries. You can also accomplish this by sending a POST request to this API using `fetch` or your favourite request library, but this example won't cover that.

## Install dependencies

```shell
$ npm install react react-dom @apollo/client graphql
```

## Import the dependencies

```js
// We are using apollo client for this exapmle
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  useQuery,
  useLazyQuery,
} from "@apollo/client";

// initialize a GraphQL client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://countries.trevorblades.com",
});
```

## Define the queries/mutations

```js
// GraphQL query that asks for names and codes for all countries & details of selected country
const LIST_COUNTRIES = gql`
  {
    countries {
      name
      code
    }
  }
`;
// GraphQL query that asks for details of a specific country
const COUNTRY_DETAILS = gql`
  query country($code: ID!) {
    country(code: $code) {
      name
      code
      currency
      emoji
      capital
      continent {
        name
      }
      phone
      languages {
        name
      }
    }
  }
`;
```

## Define the basic styles

```js
// basic styling you can use your preferred UI library as well
const basicStyles = {
  dropDownContainer: {
    display: "flex",
    justifyContent: "center",
  },
  countryDetailContainer: {
    margin: "auto auto",
    maxWidth: "900px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  },
};
```

## Create the component

```js
// create a component that renders details of selected input from coutries dropdown
function CountrySelect() {
  const [country, setCountry] = useState("IN");
  const { data, loading, error } = useQuery(LIST_COUNTRIES, { client });
  const [
    getCountryDetails,
    {
      loading: loadingCountryDetails,
      error: errorCountryDetails,
      data: dataCountryDetails,
    },
  ] = useLazyQuery(COUNTRY_DETAILS, { client });

  useEffect(() => {
    getCountryDetails({ variables: { code: country } });
  }, [country, getCountryDetails]);

  if (loading || error || loadingCountryDetails || errorCountryDetails) {
    return (
      <p>
        {error || errorCountryDetails
          ? error.message || errorCountryDetails.message
          : "Loading..."}
      </p>
    );
  }

  return (
    <>
      <div style={basicStyles.dropDownContainer}>
        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
        >
          {data.countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
      {dataCountryDetails && (
        <div style={basicStyles.countryDetailContainer}>
          <div>
            <h3> Country Code: </h3>
            <span>{dataCountryDetails.country.code}</span>
          </div>
          <div>
            <h3> Flag : </h3>
            <span>{dataCountryDetails.country.emoji}</span>
          </div>
          <div>
            <h3> Currency : </h3>
            <span>{dataCountryDetails.country.currency}</span>
          </div>
          <div>
            <h3> Dial Code : </h3>
            <span>+{dataCountryDetails.country.phone}</span>
          </div>
          <div>
            <h3> Capital : </h3>
            <span>{dataCountryDetails.country.capital}</span>
          </div>
          <div>
            <h3> Languages : </h3>
            <span>
              {dataCountryDetails.country.languages.map((lang, i) =>
                dataCountryDetails.country.languages.length === i + 1
                  ? `${lang.name}`
                  : `${lang.name},`
              )}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.render(<CountrySelect />, document.getElementById("root"));
```

## Now you're worldwide! 🌎

[![Edit Countries GraphQL API example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/countries-graphql-api-example-forked-ewxxtt)

Check out the CodeSandbox link above for a complete, working copy of this example. This `CountrySelect` component only fetches its country data when it mounts. That means that if it exists within an unmatched route or the falsey end of a condition, it doesn't request any data.

![Mr. Worldwide](./mr-worldwide.jpg)

> Reach for the stars, and if you don't grab 'em, at least you'll fall on top of the world
>
> &mdash; Pitbull
