import {gql} from 'apollo-server';

export default gql`
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
    continent(code: String): Continent
    countries: [Country]
    country(code: String): Country
    languages: [Language]
    language(code: String): Language
  }
`;
