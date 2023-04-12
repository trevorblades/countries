import de from "i18n-iso-countries/langs/de.json";
import en from "i18n-iso-countries/langs/en.json";
import es from "i18n-iso-countries/langs/es.json";
import fa from "i18n-iso-countries/langs/fa.json";
import fr from "i18n-iso-countries/langs/fr.json";
import it from "i18n-iso-countries/langs/it.json";
import ja from "i18n-iso-countries/langs/ja.json";
import nl from "i18n-iso-countries/langs/nl.json";
import pl from "i18n-iso-countries/langs/pl.json";
import pt from "i18n-iso-countries/langs/pt.json";
import ru from "i18n-iso-countries/langs/ru.json";
import tr from "i18n-iso-countries/langs/tr.json";
import vi from "i18n-iso-countries/langs/vi.json";
import zh from "i18n-iso-countries/langs/zh.json";
import { registerLocale } from "i18n-iso-countries";

// languages with > 1% estimated usage on the internet
// see: https://en.wikipedia.org/wiki/Languages_used_on_the_Internet#Content_languages_for_websites
const locales = [en, ru, es, fr, de, ja, tr, pt, fa, it, zh, nl, pl, vi];
for (const locale of locales) {
  registerLocale(locale);
}
