import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function stringQueryOperatorInput(target) {
  return {
    eq: target,
    ne: target,
    in: [target],
    nin: [target],
    regex: `^${target}$`,
  };
}

export default {
  introspection: {
    type: "sdl",
    paths: [path.join(__dirname, "../schema.graphqls")],
  },
  website: {
    template: "carbon-multi-page",
    staticAssets: path.join(__dirname, "./assets"),
    output: path.join(__dirname, "./build"),
    options: {
      appLogo:
        "https://raw.githubusercontent.com/trevorblades/countries/main/logo.png",
      siteRoot: "/countries",
      pages: [], // See: https://magidoc.js.org/cli/magidoc-configuration#website
      queryGenerationFactories: {
        "countries$filter.code": stringQueryOperatorInput("BR"),
        "countries$filter.currency": stringQueryOperatorInput("BRL"),
        "countries$filter.continent": stringQueryOperatorInput("SA"),
        "continents$filter.code": stringQueryOperatorInput("SA"),
        "languages$filter.code": stringQueryOperatorInput("pt"),
        language$code: "pt",
        continent$code: "SA",
        country$code: "BR",
        "Country.code": "BR",
        "Country.emoji": "🇧🇷",
        "Country.emojiU": "U+1F1E7 U+1F1F7",
        "Country.native": "Brasil",
        "Country.capital": "Brasilia",
        "Country.phone": "55",
        "Country.currency": "BRL",
        "Country.name": "Brazil",
        "Continent.code": "SA",
        "Continent.name": "South America",
        "Language.code": "pt",
        "Language.name": "Portuguese",
        "Language.native": "Português",
        "State.name": "Paraná",
        "State.code": "PR",
      },
    },
  },
};
