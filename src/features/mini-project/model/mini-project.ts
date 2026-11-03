import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

import type { LocalizedText } from "@/shared/types/localized-text";

export interface MiniProject {
  name: string;
  title: string;
  href: string;
  description: LocalizedText;
  icon: ComponentType<IconBaseProps>;
}
