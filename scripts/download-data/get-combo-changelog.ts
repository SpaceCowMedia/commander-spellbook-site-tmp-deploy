import fs from "fs";
import type { CompressedApiResponse } from "../../frontend/lib/types";
import get from "../shared/get";
import getCurrentGitSha from "../shared/get-current-git-sha";

type CompressedKey = keyof CompressedApiResponse;
export type Changelog = {
  gitSha: string;
  addedCombos: CompressedApiResponse[];
  deletedCombos: CompressedApiResponse[];
  updatedCombos: CompressedApiResponse[];
};

const CURRENTLY_DEPLOYED_IN_PROD_COMBO_LIST_URL =
  "https://commanderspellbook.com/api/combo-data.json";

const properties = ["c", "i", "p", "s", "r"] as CompressedKey[];
const propertyMap = {
  c: "Cards",
  i: "Color Identity",
  p: "Prerequisites",
  s: "Steps",
  r: "Results",
} as Record<CompressedKey, string>;

// note: for this to work, this must be run after the combo-data has been
// created locally, but before it gets deployed to prod
export default function createChangelog() {
  const currentGithSha = getCurrentGitSha();

  return get<CompressedApiResponse[]>(
    CURRENTLY_DEPLOYED_IN_PROD_COMBO_LIST_URL
  ).then((oldComboData) => {
    const addedCombos = [] as CompressedApiResponse[];
    const deletedCombos = [] as CompressedApiResponse[];
    const updatedCombos = [] as CompressedApiResponse[];

    const newComboData = JSON.parse(
      fs.readFileSync("./frontend/public/api/combo-data.json", "utf8")
    ) as CompressedApiResponse[];
    newComboData.forEach((combo) => {
      const oldCombo = oldComboData.find((oldCombo) => {
        return oldCombo.d === combo.d;
      });

      if (!oldCombo) {
        addedCombos.push(combo);
        return;
      }

      let change = "";

      properties.forEach((key) => {
        const oldValue = JSON.stringify(oldCombo[key]);
        const newValue = JSON.stringify(combo[key]);

        if (oldValue !== newValue) {
          const label = propertyMap[key];
          change += `${label} changed. Before: ${oldCombo[key]} | After: ${combo[key]}\n`;
        }
      });

      if (change) {
        updatedCombos.push(combo);
      }
    });

    oldComboData.forEach((oldCombo) => {
      const newCombo = newComboData.find((combo) => {
        return combo.d === oldCombo.d;
      });
      if (!newCombo) {
        deletedCombos.push(oldCombo);
      }
    });

    return {
      gitSha: currentGithSha,
      addedCombos,
      deletedCombos,
      updatedCombos,
    };
  });
}
