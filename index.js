const provinces = require('provinces');
const {ApolloServer, gql} = require('apollo-server');
const {continents, countries, languages} = require('countries-list');

const typeDefs = gql`
  type Continent {
    code: ID!
    name: String!
    countries: [Country!]!
  }

  type Country {
    code: ID!
    name: String!
    native: String!
    phone: String!
    continent: Continent!
    capital: String
    currency: String
    languages: [Language!]!
    emoji: String!
    emojiU: String!
    states: [State!]!
  }

  type State {
    code: String
    name: String!
    country: Country!
  }

  type Language {
    code: ID!
    name: String
    native: String
    rtl: Boolean!
  }

  type Query {
    continents: [Continent!]!
    continent(code: ID!): Continent
    countries: [Country!]!
    country(code: ID!): Country
    languages: [Language!]!
    language(code: ID!): Language
  }
`;

const resolvers = {
  Country: {
    capital: country => country.capital || null,
    currency: country => country.currency || null,
    continent({continent}) {
      return {
        code: continent,
        name: continents[continent]
      };
    },
    languages(country) {
      return country.languages.map(code => {
        const language = languages[code];
        return {
          ...language,
          code
        };
      });
    },
    states(country) {
      return provinces.filter(province => province.country === country.code);
    }
  },
  State: {
    code(state) {
      return state.short;
    },
    country(state) {
      return countries[state.country];
    }
  },
  Continent: {
    countries(continent) {
      return Object.entries(countries)
        .filter(entry => entry[1].continent === continent.code)
        .map(([code, country]) => ({
          ...country,
          code
        }));
    }
  },
  Language: {
    rtl(language) {
      return Boolean(language.rtl);
    }
  },
  Query: {
    continent(parent, {code}) {
      const name = continents[code];
      return (
        name && {
          code,
          name
        }
      );
    },
    continents() {
      return Object.entries(continents).map(([code, name]) => ({
        code,
        name
      }));
    },
    country(parent, {code}) {
      const country = countries[code];
      return (
        country && {
          ...country,
          code
        }
      );
    },
    countries() {
      return Object.entries(countries).map(([code, country]) => ({
        ...country,
        code
      }));
    },
    language(parent, {code}) {
      const language = languages[code];
      return (
        language && {
          ...language,
          code
        }
      );
    },
    languages() {
      return Object.entries(languages).map(([code, language]) => ({
        ...language,
        code
      }));
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  engine: {
    apiKey: process.env.ENGINE_API_KEY
  }
});

server.listen({port: process.env.PORT || 4000}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
