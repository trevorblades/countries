import SchemaBuilder from "@pothos/core";
import provinces from "provinces";
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
    code: t.exposeString("code"),
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
    code: t.exposeString("code"),
    name: t.exposeString("name"),
    native: t.exposeString("native"),
    phone: t.exposeString("phone"),
    capital: t.string({
      nullable: true,
      resolve: (country) => country.capital || null, // account for empty string
    }),
    currency: t.string({
      nullable: true,
      resolve: (country) => country.currency || null, // account for empty string
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
      type: [ProvinceRef],
      resolve: (country) =>
        provinces.filter((province) => province.country === country.code),
    }),
  }),
});

const LanguageRef = builder.objectRef<Language & { code: string }>("Language");

builder.objectType(LanguageRef, {
  fields: (t) => ({
    code: t.exposeString("code"),
    name: t.exposeString("name"),
    native: t.exposeString("native"),
    rtl: t.boolean({
      resolve: (language) => language.rtl === 1,
    }),
  }),
});

const ProvinceRef = builder.objectRef<Province>("Province");

builder.objectType(ProvinceRef, {
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

builder.queryType({
  fields: (t) => ({
    continents: t.field({
      type: [Continent],
      resolve: () =>
        Object.entries(continents).map(
          ([code, name]) => new Continent(code, name)
        ),
    }),
    continent: t.field({
      type: Continent,
      args: {
        code: t.arg.string({ required: true }),
      },
      resolve: (_, { code }) =>
        new Continent(code, continents[code as keyof typeof continents]),
    }),
    countries: t.field({
      type: [CountryRef],
      resolve: () =>
        Object.entries(countries).map(([code, country]) => ({
          ...country,
          code,
        })),
    }),
    country: t.field({
      type: CountryRef,
      args: {
        code: t.arg.string({ required: true }),
      },
      resolve: (_, { code }) => ({
        ...countries[code as keyof typeof countries],
        code,
      }),
    }),
    languages: t.field({
      type: [LanguageRef],
      resolve: () =>
        Object.entries(languages).map(([code, language]) => ({
          ...language,
          code,
        })),
    }),
    language: t.field({
      type: LanguageRef,
      args: {
        code: t.arg.string({ required: true }),
      },
      resolve: (_, { code }) => ({
        ...languages[code as keyof typeof languages],
        code,
      }),
    }),
  }),
});

export const schema = builder.toSchema();
