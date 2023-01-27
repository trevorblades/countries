import provinces from "provinces";
import sift from "sift";
import { Resolvers } from "./resolvers-types";
import { continents, countries, languages } from "countries-list";

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
        .filter((entry) => entry[1].continent === continent.code)
        .map(([code, country]) => ({
          ...country,
          code,
        })),
  },
  Language: {
    rtl: (language) => Boolean(language.rtl),
  },
  Query: {
    continent(_, { code }) {
      const name = continents[code];
      return (
        name && {
          code,
          name,
        }
      );
    },
    continents: (_, { filter }) => {
      return Object.entries(continents)
        .map(([code, name]) => ({
          code,
          name,
        }))
        .filter(filterToSift(filter));
    },
    country(_, { code }) {
      const country = countries[code];
      return (
        country && {
          ...country,
          code,
        }
      );
    },
    countries: (_, { filter }) =>
      Object.entries(countries)
        .map(([code, country]) => ({
          ...country,
          code,
        }))
        .filter(filterToSift(filter)),
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
