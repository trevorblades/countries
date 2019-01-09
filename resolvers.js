function byCode(code) {
  return item => item.code === code;
}

export default {
  Country: {
    continent: (country, args, {continents}) =>
      continents.find(continent => continent.code === country.continent),
    languages: (country, args, {languages}) =>
      languages.filter(language => country.languages.includes(language.code))
  },
  Continent: {
    countries: (continent, args, {countries}) =>
      countries.filter(country => country.continent === continent.code)
  },
  Query: {
    continent: (parent, args, {continents}) =>
      continents.find(byCode(args.code)),
    continents: (parent, args, {continents}) => continents,
    country: (parent, args, {countries}) => countries.find(byCode(args.code)),
    countries: (parent, args, {countries}) => countries,
    language: (parent, args, {languages}) => languages.find(byCode(args.code)),
    languages: (parent, args, {languages}) => languages
  }
};
