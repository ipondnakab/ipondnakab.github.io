export interface WorkExperience {
  urlImage: string;
  title: string;
  position: string;
  description: string;
  projects?: ProjectExperience[];
}

export interface ProjectExperience {
  urlImage?: string;
  description: string | string[];
  team?: string;
  title: string;
  projectUrl?: string;
}
