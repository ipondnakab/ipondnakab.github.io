export type CreditCategoryId =
  "framework" | "ui" | "threeD" | "data" | "i18n" | "tooling" | "hosting";

export interface CreditedProject {
  /** Display name, spelled the way the project brands itself. */
  name: string;
  /**
   * The project's own one-line description, kept in English on purpose: these
   * are the maintainers' words, not site copy. Everything the page says in its
   * own voice goes through i18n.
   */
  description: string;
  url: string;
  /**
   * SPDX identifier where there is one, or a plain-language label when the
   * licence is not an OSI licence. Verified against each package's manifest
   * and LICENSE file — do not guess this.
   */
  license: string;
}

export interface CreditCategory {
  id: CreditCategoryId;
  projects: CreditedProject[];
}
