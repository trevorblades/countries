import resolvers from './resolvers';
import typeDefs from './schema';
import {ApolloServer} from 'apollo-server';
import {continents, countries, languages} from 'countries-list';

function toArray(object) {
  return Object.keys(object).map(code => ({
    ...object[code],
    code
  }));
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  engine: {
    apiKey: process.env.ENGINE_API_KEY
  },
  context: {
    continents: Object.entries(continents).map(([code, name]) => ({
      code,
      name
    })),
    countries: toArray(countries),
    languages: toArray(languages)
  }
});

server.listen({port: process.env.PORT}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
