import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
    },
  },
};
