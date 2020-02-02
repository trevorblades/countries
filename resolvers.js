import provinces from 'provinces';
import {continents, countries, languages} from 'countries-list';

export default {
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
