import resolvers from './resolvers.js';
import typeDefs from './schema.js';
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
  context: {
    continents: Object.entries(continents).map(([code, name]) => ({
      code,
      name
    })),
    engine: {
      apiKey: process.env.ENGINE_API_KEY
    },
    countries: toArray(countries),
    languages: toArray(languages)
  }
});

server.listen({port: process.env.PORT}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
