/**
 * Public API. Import types, constants and helpers from here.
 *
 * Components are deliberately NOT re-exported: in the App Router every client
 * component reachable from a barrel is registered in the route's client-
 * reference manifest, so re-exporting them pulls the whole feature into any
 * route that touches the barrel. Import components by path instead, e.g.
 * `@/features/<name>/components/<Component>`.
 */
export { CREDITED_PROJECT_COUNT, CREDIT_CATEGORIES } from "./constants";
export type {
  CreditCategory,
  CreditCategoryId,
  CreditedProject,
} from "./model/credit";
