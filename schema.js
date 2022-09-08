import countriesList from "countries-list";
import fs from "fs";
import path from "path";
import provinces from "provinces";
import sift from "sift";
import { fileURLToPath } from "url";
import { gql } from "apollo-server";

const schema = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "./schema.graphqls"),
  "utf8"
);

export const typeDefs = gql(schema);

function filterToSift(filter = {}) {
  return sift(
    Object.entries(filter).reduce(
      (acc, [key, operators]) => ({
        ...acc,
        [key]: operatorsToSift(operators),
      }),
      {}
    )
  );
}

function operatorsToSift(operators) {
  return Object.entries(operators).reduce(
    (acc, [operator, value]) => ({
      ...acc,
      ["$" + operator]: value,
    }),
    {}
  );
}

const { continents, countries, languages } = countriesList;

export const resolvers = {
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
    continent(parent, { code }) {
      const name = continents[code];
      return (
        name && {
          code,
          name,
        }
      );
    },
    continents: (parent, { filter }) =>
      Object.entries(continents)
        .map(([code, name]) => ({
          code,
          name,
        }))
        .filter(filterToSift(filter)),
    country(parent, { code }) {
      const country = countries[code];
      return (
        country && {
          ...country,
          code,
        }
      );
    },
    countries: (parent, { filter }) =>
      Object.entries(countries)
        .map(([code, country]) => ({
          ...country,
          code,
        }))
        .filter(filterToSift(filter)),
    language(parent, { code }) {
      const language = languages[code];
      return (
        language && {
          ...language,
          code,
        }
      );
    },
    languages: (parent, { filter }) =>
      Object.entries(languages)
        .map(([code, language]) => ({
          ...language,
          code,
        }))
        .filter(filterToSift(filter)),
  },
};
