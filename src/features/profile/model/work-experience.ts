import { LocalizedText } from "@/shared/types/localized-text";

export interface WorkExperience {
  urlImage: string;
  title: LocalizedText;
  position: string;
  description: LocalizedText;
  projects?: ProjectExperience[];
}

export interface ProjectExperience {
  urlImage?: string;
  description: LocalizedText | LocalizedText[];
  team?: string;
  title: string;
  projectUrl?: string;
}
