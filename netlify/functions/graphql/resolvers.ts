import provinces from "provinces";
import sift from "sift";
import { Country, continents, countries, languages } from "countries-list";
import { Resolvers } from "./resolvers-types";

const filterToSift = (filter = {}) =>
  sift(
    Object.entries(filter).reduce(
      (acc, [key, operators]) => ({
        ...acc,
        [key]: operatorsToSift(operators),
      }),
      {}
    )
  );

function operatorsToSift(operators) {
  return Object.entries(operators).reduce(
    (acc, [operator, value]) => ({
      ...acc,
      ["$" + operator]: value,
    }),
    {}
  );
}

class CountryLike {
  constructor(public code: string, public country: Country) {
    this.code = code;
  }
}

class Continent {
  constructor(public code: string, public name: string) {
    this.code = code;
    this.name = name;
  }

  get countries() {
    return Object.entries(countries)
      .filter(([, country]) => country.continent === this.code)
      .map(([code, country]) => ({
        ...country,
        code,
      }));
  }
}

const countriesMap = new Map(Object.entries(countries));
const continentsMap = new Map(Object.entries(continents));

export const resolvers: Resolvers = {
  Country: {
    capital: (country) => country.capital || null,
    currency: (country) => country.currency || null,
    continent: ({ continent }) => ({
      code: continent,
      name: continents[continent],
    }),
    languages: (country) =>
      country.languages.map((code) => {
        const language = languages[code];
        return {
          ...language,
          code,
        };
      }),
    states: (country) =>
      provinces.filter((province) => province.country === country.code),
  },
  State: {
    code: (state) => state.short,
    country: (state) => countries[state.country],
  },
  Continent: {
    countries: (continent) =>
      Object.entries(countries)
        .filter(([, country]) => country.continent === continent.code)
        .map(([code, country]) => ({
          ...country,
          code,
        })),
  },
  Language: {
    rtl: (language) => language.rtl === true,
  },
  Query: {
    continent(_, { code }) {
      const name = continentsMap.get(code);

      if (!name) {
        return null;
      }

      return {
        code,
        name,
      };
    },
    continents: (_, { filter }) => {
      const data = [...continentsMap].map(([code, name]) => ({
        code,
        name,
      }));

      if (filter?.code) {
        return data.filter(
          sift({
            code: filter.code,
          })
        );
      }

      return data;
    },
    country(_, { code }) {
      const country = countriesMap.get(code);

      if (!country) {
        return null;
      }

      const { continent, languages, ...rest } = country;

      return {
        ...rest,
        code,
      };
    },
    countries: (_, { filter }) => {
      const filterCountries = sift({
        $in: filter?.code?.in,
      });
      return Object.entries(countries)
        .map(([code, country]) => ({
          ...country,
          code,
        }))
        .filter(filterToSift(filter));
    },
    language(_, { code }) {
      const language = languages[code];
      return (
        language && {
          ...language,
          code,
        }
      );
    },
    languages: (_, { filter }) =>
      Object.entries(languages)
        .map(([code, language]) => ({
          ...language,
          code,
        }))
        .filter(filterToSift(filter)),
  },
};
