/**
 * Public API. Import types, constants and helpers from here.
 *
 * Components are deliberately NOT re-exported: in the App Router every client
 * component reachable from a barrel is registered in the route's client-
 * reference manifest, so re-exporting them pulls the whole feature into any
 * route that touches the barrel. Import components by path instead, e.g.
 * `@/features/<name>/components/<Component>`.
 */
export { OUTSOURCE_PROJECTS } from "./constants/outsource-projects";
export { PROFILE_AVATARS } from "./constants/profile-avatars";
export { WORK_EXPERIENCES } from "./constants/work-experiences";
export type { ProfileAvatarImage } from "./model/profile";
export type {
  ProjectExperience,
  WorkExperience,
} from "./model/work-experience";
