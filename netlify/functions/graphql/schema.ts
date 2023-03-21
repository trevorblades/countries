import SchemaBuilder from "@pothos/core";
import provinces from "provinces";
import sift, { $eq, $in, $ne, $nin, $regex } from "sift";
import { continents, countries, languages } from "countries-list";
import type { Country, Language } from "countries-list";

const builder = new SchemaBuilder({});

class Continent {
  code: string;
  name: string;

  constructor(code: string, name: string) {
    this.code = code;
    this.name = name;
  }
}

builder.objectType(Continent, {
  name: "Continent",
  fields: (t) => ({
    code: t.exposeID("code"),
    name: t.exposeString("name"),
    countries: t.field({
      type: [CountryRef],
      resolve: (continent) =>
        Object.entries(countries)
          .filter(([, country]) => country.continent === continent.code)
          .map(([code, country]) => ({
            ...country,
            code,
          })),
    }),
  }),
});

const CountryRef = builder.objectRef<Country & { code: string }>("Country");

builder.objectType(CountryRef, {
  fields: (t) => ({
    code: t.exposeID("code"),
    name: t.exposeString("name"),
    native: t.exposeString("native"),
    phone: t.exposeString("phone"),
    phones: t.stringList({
      resolve: (country) => country.phone.split(","),
    }),
    capital: t.string({
      nullable: true,
      resolve: (country) => country.capital || null, // account for empty string
    }),
    currency: t.string({
      nullable: true,
      resolve: (country) => country.currency || null, // account for empty string
    }),
    currencies: t.stringList({
      resolve: (country) => country.currency.split(","),
    }),
    emoji: t.exposeString("emoji"),
    emojiU: t.exposeString("emojiU"),
    continent: t.field({
      type: Continent,
      resolve: (country) =>
        new Continent(
          country.continent,
          continents[country.continent as keyof typeof continents]
        ),
    }),
    languages: t.field({
      type: [LanguageRef],
      resolve: (country) =>
        country.languages.map((code) => ({
          ...languages[code as keyof typeof languages],
          code,
        })),
    }),
    states: t.field({
      type: [StateRef],
      resolve: (country) =>
        provinces.filter((province) => province.country === country.code),
    }),
  }),
});

const LanguageRef = builder.objectRef<Language & { code: string }>("Language");

builder.objectType(LanguageRef, {
  fields: (t) => ({
    code: t.exposeID("code"),
    name: t.exposeString("name"),
    native: t.exposeString("native"),
    rtl: t.boolean({
      resolve: (language) => language.rtl === 1,
    }),
  }),
});

const StateRef = builder.objectRef<Province>("State");

builder.objectType(StateRef, {
  fields: (t) => ({
    name: t.exposeString("name"),
    code: t.exposeString("short", { nullable: true }),
    country: t.field({
      type: CountryRef,
      resolve: (province) => ({
        ...countries[province.country as keyof typeof countries],
        code: province.country,
      }),
    }),
  }),
});

const StringQueryOperatorInput = builder.inputType("StringQueryOperatorInput", {
  fields: (t) => ({
    eq: t.string(),
    ne: t.string(),
    in: t.stringList(),
    nin: t.stringList(),
    regex: t.string(),
  }),
});

const CountryFilterInput = builder.inputType("CountryFilterInput", {
  fields: (t) => ({
    code: t.field({ type: StringQueryOperatorInput }),
    currency: t.field({ type: StringQueryOperatorInput }),
    continent: t.field({ type: StringQueryOperatorInput }),
  }),
});

const ContinentFilterInput = builder.inputType("ContinentFilterInput", {
  fields: (t) => ({
    code: t.field({ type: StringQueryOperatorInput }),
  }),
});

const LanguageFilterInput = builder.inputType("LanguageFilterInput", {
  fields: (t) => ({
    code: t.field({ type: StringQueryOperatorInput }),
  }),
});

const operations = {
  eq: $eq,
  ne: $ne,
  in: $in,
  nin: $nin,
  regex: $regex,
};

builder.queryType({
  fields: (t) => ({
    continents: t.field({
      type: [Continent],
      args: {
        filter: t.arg({
          type: ContinentFilterInput,
          defaultValue: {},
        }),
      },
      resolve: (_, { filter }) =>
        Object.entries(continents)
          .map(([code, name]) => new Continent(code, name))
          // need to parse and stringify because of some null prototype
          // see https://stackoverflow.com/q/53983315/8190832
          .filter(sift(JSON.parse(JSON.stringify(filter)), { operations })),
    }),
    continent: t.field({
      type: Continent,
      args: {
        code: t.arg.id({ required: true }),
      },
      resolve: (_, { code }) =>
        new Continent(
          code.toString(),
          continents[code as keyof typeof continents]
        ),
    }),
    countries: t.field({
      type: [CountryRef],
      args: {
        filter: t.arg({
          type: CountryFilterInput,
          defaultValue: {},
        }),
      },
      resolve: (_, { filter }) => {
        return Object.entries(countries)
          .map(([code, country]) => ({
            ...country,
            code,
          }))
          .filter(sift(JSON.parse(JSON.stringify(filter)), { operations }));
      },
    }),
    country: t.field({
      type: CountryRef,
      args: {
        code: t.arg.id({ required: true }),
      },
      resolve: (_, { code }) => ({
        ...countries[code as keyof typeof countries],
        code: code.toString(),
      }),
    }),
    languages: t.field({
      type: [LanguageRef],
      args: {
        filter: t.arg({
          type: LanguageFilterInput,
          defaultValue: {},
        }),
      },
      resolve: (_, { filter }) =>
        Object.entries(languages)
          .map(([code, language]) => ({
            ...language,
            code,
          }))
          .filter(sift(JSON.parse(JSON.stringify(filter)), { operations })),
    }),
    language: t.field({
      type: LanguageRef,
      args: {
        code: t.arg.id({ required: true }),
      },
      resolve: (_, { code }) => ({
        ...languages[code as keyof typeof languages],
        code: code.toString(),
      }),
    }),
  }),
});

export const schema = builder.toSchema();
