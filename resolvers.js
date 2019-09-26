import {continents, countries, languages} from 'countries-list';

export default {
  Country: {
    continent({continent}) {
      return {
        code: continent,
        name: continents[continent]
      };
    },
    languages(parent) {
      return parent.languages.map(code => {
        const language = languages[code];
        return {
          ...language,
          code
        };
      });
    }
  },
  Continent: {
    countries(parent) {
      return Object.entries(countries)
        .filter(entry => entry[1].continent === parent.code)
        .map(([code, country]) => ({
          ...country,
          code
        }));
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
