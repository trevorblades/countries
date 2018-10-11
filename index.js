import {ApolloServer, gql} from 'apollo-server';
import {countries} from 'countries-list';

const typeDefs = gql`
  type Country {
    code: String
    name: String
    native: String
    phone: String
    continent: String
    currency: String
    languages: [String]
    emoji: String
    emojiU: String
  }

  type Query {
    countries: [Country]
  }
`;

const countriesArray = Object.keys(countries).map(code => ({
  code,
  ...countries[code]
}));

const resolvers = {
  Query: {
    countries: () => countriesArray
  }
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
