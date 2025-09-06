import { IpcMainInvokeEvent } from "electron";

import { config } from "../config";
import languages from "../config/languages";
import { LanguageOption } from "../types";
import escape from "regexp.escape";

/**
 * @brief Search the available languages and returns the list of possible options for a given query. The options always contained at least the last selected value.
 * @param query - the query to search the languages. The search applies on both label and value.
 * @param selectedValue - the currently selected language value.
 * @returns The list of the languages in order of relevance. Truncated at `config.search.languages.limit` elements
 */
export function searchLanguages(
  _: IpcMainInvokeEvent,
  query: string,
  selectedValue: string,
): LanguageOption[] {
  const re = new RegExp(escape(query), "i");
  return languages
    .filter(
      (item) =>
        item.value.match(re) !== null ||
        item.label.match(re) !== null ||
        item.value === selectedValue,
    )
    .sort((a, b) => {
      if (a.value === selectedValue) {
        return -1;
      }

      if (b.value === selectedValue) {
        return 1;
      }

      const matchAValue = a.value.match(re);
      const matchALabel = a.label.match(re);
      const matchBValue = b.value.match(re);
      const matchBLabel = b.label.match(re);

      const aValueLength = matchAValue !== null ? matchAValue[0].length : 0;
      const aLabelLength = matchALabel !== null ? matchALabel[0].length : 0;
      const bValueLength = matchBValue !== null ? matchBValue[0].length : 0;
      const bLabelLength = matchBLabel !== null ? matchBLabel[0].length : 0;

      const scoreA =
        (aValueLength / a.value.length + aLabelLength / a.label.length) / 2;
      const scoreB =
        (bValueLength / b.value.length + bLabelLength / b.label.length) / 2;

      if (scoreA > scoreB) {
        return -1;
      }

      if (scoreA < scoreB) {
        return 1;
      }

      return 0;
    })
    .slice(0, config.search.languages.limit);
}
