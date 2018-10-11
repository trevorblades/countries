import {ApolloServer, gql} from 'apollo-server';
import {continents, countries, languages} from 'countries-list';

function toArray(object) {
  return Object.keys(object).map(code => ({
    ...object[code],
    code
  }));
}

const data = {
  continents: Object.entries(continents).map(([code, name]) => ({code, name})),
  countries: toArray(countries),
  languages: toArray(languages)
};

const typeDefs = gql`
  type Continent {
    code: String
    name: String
  }

  type Country {
    code: String
    name: String
    native: String
    phone: String
    continent: Continent
    currency: String
    languages: [Language]
    emoji: String
    emojiU: String
  }

  type Language {
    code: String
    name: String
    native: String
    rtl: Int
  }

  type Query {
    continents: [Continent]
    countries: [Country]
    languages: [Language]
  }
`;

const resolvers = {
  Country: {
    continent: country =>
      data.continents.find(continent => continent.code === country.continent),
    languages: country =>
      data.languages.filter(language =>
        country.languages.includes(language.code)
      )
  },
  Query: {
    continents: () => data.continents,
    countries: () => data.countries,
    languages: () => data.languages
  }
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen({port: process.env.PORT}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
