import "./locales";
import SchemaBuilder from "@pothos/core";
import ValidationPlugin from "@pothos/plugin-validation";
import provinces from "provinces";
import sift, { $eq, $in, $ne, $nin, $regex } from "sift";
import { GraphQLError } from "graphql";
import { continents, countries, languages } from "countries-list";
import { countryToAwsRegion } from "country-to-aws-region";
import { country as getCountry } from "iso-3166-2";
import { getName, langs } from "i18n-iso-countries";
import { pathToArray } from "@graphql-tools/utils";
import type { Country, Language } from "countries-list";
import type { SubdivisionInfo } from "iso-3166-2";

const builder = new SchemaBuilder({
  plugins: [ValidationPlugin],
  validationOptions: {
    validationError: (zodError, _, __, info) => {
      const [{ message, path }] = zodError.issues;
      return new GraphQLError(message, {
        path: [...pathToArray(info.path), ...path],
        extensions: {
          code: "VALIDATION_ERROR",
        },
      });
    },
  },
});

class Continent {
  constructor(public code: string, public name: string) {}
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

const SubdivisionRef = builder.objectRef<
  SubdivisionInfo.Partial & { code: string }
>("Subdivision");

builder.objectType(SubdivisionRef, {
  fields: (t) => ({
    code: t.exposeID("code"),
    name: t.exposeString("name"),
    emoji: t.string({
      nullable: true,
      resolve: (sub) => {
        switch (sub.code) {
          case "GB-ENG":
            return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
          case "GB-SCT":
            return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
          case "GB-WLS":
            return "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
          default:
            return null;
        }
      },
    }),
  }),
});

const CountryRef = builder.objectRef<Country & { code: string }>("Country");

builder.objectType(CountryRef, {
  fields: (t) => ({
    code: t.exposeID("code"),
    name: t.string({
      args: {
        lang: t.arg.string({
          validate: (lang) => langs().includes(lang),
        }),
      },
      resolve: async (country, { lang }) => {
        if (lang) {
          return getName(country.code, lang) ?? country.name;
        }

        return country.name;
      },
    }),
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
      // TODO: deprecate this resolver and merge with subdivisions
      resolve: (country) =>
        provinces.filter((province) => province.country === country.code),
    }),
    awsRegion: t.string({
      resolve: (country) => countryToAwsRegion(country.code),
    }),
    subdivisions: t.field({
      type: [SubdivisionRef],
      resolve: ({ code }) => {
        const country = getCountry(code);
        if (!country) {
          return [];
        }

        return Object.entries(country.sub)
          .map(([code, sub]) => ({
            ...sub,
            code,
          }))
          .filter(
            (sub) =>
              // account for subdivisions of Great Britain
              sub.type === "Country" || sub.type === "Province"
          );
      },
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
    countries: t.field({
      type: [CountryRef],
      resolve: (language) => Object.entries(countries)
        .filter(([, country]) => Array.isArray(country.languages) && country.languages.includes(language.code))
        .map(([code, country]) => ({...country, code}))
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
    name: t.field({ type: StringQueryOperatorInput }),
    currency: t.field({ type: StringQueryOperatorInput }),
    continent: t.field({ type: StringQueryOperatorInput }),
    language: t.field({ type: StringQueryOperatorInput }),
  }),
});

const ContinentFilterInput = builder.inputType("ContinentFilterInput", {
  fields: (t) => ({
    code: t.field({ type: StringQueryOperatorInput }),
    // A continent matches if it has at least one country satisfying this filter
    country: t.field({ type: CountryFilterInput }),
    // A continent matches if it has at least one language (spoken within it) satisfying this filter
    language: t.field({ type: LanguageFilterInput }),
  }),
});

const LanguageFilterInput = builder.inputType("LanguageFilterInput", {
  fields: (t) => ({
    code: t.field({ type: StringQueryOperatorInput }),
    country: t.field({ type: StringQueryOperatorInput }),
  }),
});

const operations = {
  eq: $eq,
  ne: $ne,
  in: $in,
  nin: $nin,
  regex: $regex,
};

const isValidContinentCode = (
  code: string | number
): code is keyof typeof continents => code in continents;

const isValidCountryCode = (
  code: string | number
): code is keyof typeof countries => code in countries;

const isValidLanguageCode = (
  code: string | number
): code is keyof typeof languages => code in languages;



export type StringOps = {
  eq?: string;
  ne?: string;
  in?: string[];
  nin?: string[];
  regex?: string;
};

// true if the array `values` satisfies the StringOps (ANY-match semantics)
const anyMatches = (values: string[], ops?: StringOps) => {
  if (!ops) return true;

  const has = (v: string) => values.includes(v);

  if (ops.eq !== undefined && !has(ops.eq)) return false;
  if (ops.in && !ops.in.some(has)) return false;

  if (ops.regex) {
    const re = new RegExp(ops.regex);
    if (!values.some((v) => re.test(v))) return false;
  }

  if (ops.ne !== undefined && has(ops.ne)) return false;
  if (ops.nin && ops.nin.some(has)) return false;

  return true;
};

// Given a language code, return a list of country codes where it's spoken
const countryCodesForLanguage = (langCode: string) =>
  Object.entries(countries)
    .filter(([, c]) => Array.isArray(c.languages) && c.languages.includes(langCode))
    .map(([code]) => code);

// Countries within a continent (as Country objects with `code`)
const countriesInContinent = (continentCode: string) =>
  Object.entries(countries)
    .filter(([, c]) => c.continent === continentCode)
    .map(([code, c]) => ({ ...c, code }));

// Unique language codes used within a continent
const languageCodesInContinent = (continentCode: string) => {
  const set = new Set<string>();
  countriesInContinent(continentCode).forEach((c) => {
    if (Array.isArray(c.languages)) c.languages.forEach((lc) => set.add(lc));
  });
  return Array.from(set);
};

// Language objects used within a continent (with `code`)
const languagesInContinent = (continentCode: string) =>
  languageCodesInContinent(continentCode).map((code) => ({
    ...(languages[code as keyof typeof languages] as Language),
    code,
  }));

// Build a predicate to test a Country against CountryFilterInput (incl. language ops)
const makeCountryPredicate = (
  filter?: { language?: StringOps } & Record<string, unknown>
) => {
  if (!filter || Object.keys(filter).length === 0) return () => true;
  const { language, ...rest } = filter;
  const base = sift(JSON.parse(JSON.stringify(rest)), { operations });
  return (c: (Country & { code: string })) =>
    base(c) && anyMatches(Array.isArray(c.languages) ? c.languages : [], language);
};

// Build a predicate to test a Language against LanguageFilterInput (incl. country ops)
const makeLanguagePredicate = (
  filter?: { country?: StringOps } & Record<string, unknown>
) => {
  if (!filter || Object.keys(filter).length === 0) return () => true;
  const { country, ...rest } = filter;
  const base = sift(JSON.parse(JSON.stringify(rest)), { operations });
  return (l: (Language & { code: string })) =>
    base(l) && anyMatches(countryCodesForLanguage(l.code), country);
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
      resolve: (_, { filter }) => {
        const { country: countryFilter, language: languageFilter, ...rest } =
          (filter ?? {}) as {
            country?: { language?: StringOps } & Record<string, unknown>;
            language?: { country?: StringOps } & Record<string, unknown>;
          };

        // base continent-level filter (currently only `code`)
        const base = sift(JSON.parse(JSON.stringify(rest)), { operations });

        const countryPred = makeCountryPredicate(countryFilter);
        const languagePred = makeLanguagePredicate(languageFilter);
        return Object.entries(continents)
          .map(([code, name]) => new Continent(code, name))
          // need to parse and stringify because of some null prototype
          // see https://stackoverflow.com/q/53983315/8190832
          .filter((cont) => base(cont))
          .filter((cont) => {
            // If country filter provided, continent must have at least one matching country
            const okByCountry = countryFilter
              ? countriesInContinent(cont.code).some(countryPred)
              : true;

            // If language filter provided, continent must have at least one matching language
            const okByLanguage = languageFilter
              ? languagesInContinent(cont.code).some(languagePred)
              : true;

            return okByCountry && okByLanguage;
          });
      }
    }),
    continent: t.field({
      type: Continent,
      args: {
        code: t.arg.id({ required: true }),
      },
      nullable: true,
      resolve: (_, { code }) =>
        isValidContinentCode(code)
          ? new Continent(code, continents[code])
          : null,
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
        const { language, ...rest } = (filter ?? {}) as { language?: StringOps };
        const base = sift(JSON.parse(JSON.stringify(rest)), { operations });

        return Object.entries(countries)
          .map(([code, country]) => ({ ...country, code }))
          .filter((c) => base(c))
          .filter((c) => anyMatches(Array.isArray(c.languages) ? c.languages : [], language));
      },
    }),
    country: t.field({
      type: CountryRef,
      args: {
        code: t.arg.id({ required: true }),
      },
      nullable: true,
      resolve: (_, { code }) =>
        isValidCountryCode(code)
          ? {
              ...countries[code],
              code,
            }
          : null,
    }),
    languages: t.field({
      type: [LanguageRef],
      args: {
        filter: t.arg({
          type: LanguageFilterInput,
          defaultValue: {},
        }),
      },
      resolve: (_, { filter }) => {
        const { country, ...rest } = (filter ?? {}) as { country?: StringOps };
        const base = sift(JSON.parse(JSON.stringify(rest)), { operations });

        return Object.entries(languages)
          .map(([code, language]) => ({ ...language, code }))
          .filter((l) => base(l))
          .filter((l) => anyMatches(countryCodesForLanguage(l.code), country));
      },
    }),
    language: t.field({
      type: LanguageRef,
      args: {
        code: t.arg.id({ required: true }),
      },
      nullable: true,
      resolve: (_, { code }) =>
        isValidLanguageCode(code)
          ? {
              ...languages[code],
              code,
            }
          : null,
    }),
  }),
});

export const schema = builder.toSchema();
