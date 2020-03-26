const provinces = require('provinces');
const {ApolloServer, gql} = require('apollo-server');
const {continents, countries, languages} = require('countries-list');

const typeDefs = gql`
  enum ContinentCode {
    ${Object.keys(continents)}
  }

  enum CountryCode {
    ${Object.keys(countries)}
  }

  enum LanguageCode {
    ${Object.keys(languages)}
  }

  type Continent {
    code: ContinentCode
    name: String
    countries: [Country]
  }

  type Country {
    code: CountryCode
    name: String
    native: String
    phone: String
    continent: Continent
    currency: String
    languages: [Language]
    emoji: String
    emojiU: String
    states: [State]
  }

  type State {
    code: String
    name: String
    country: Country
  }

  type Language {
    code: LanguageCode
    name: String
    native: String
    rtl: Boolean
  }

  type Query {
    continents: [Continent]
    continent(code: ContinentCode!): Continent
    countries: [Country]
    country(code: CountryCode!): Country
    languages: [Language]
    language(code: LanguageCode!): Language
  }
`;

const resolvers = {
  Country: {
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
      return {
        code,
        name: continents[code]
      };
    },
    continents() {
      return Object.entries(continents).map(([code, name]) => ({
        code,
        name
      }));
    },
    country(parent, {code}) {
      const country = countries[code];
      return {
        ...country,
        code
      };
    },
    countries() {
      return Object.entries(countries).map(([code, country]) => ({
        ...country,
        code
      }));
    },
    language(parent, {code}) {
      const language = languages[code];
      return {
        ...language,
        code
      };
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

server.listen({port: process.env.PORT}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
