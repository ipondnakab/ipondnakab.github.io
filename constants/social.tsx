import { Social } from "@/interfaces/social";
import { AiFillMediumCircle } from "react-icons/ai";
import {
  TiSocialLinkedinCircular,
  TiSocialFacebookCircular,
} from "react-icons/ti";
import { VscGithub } from "react-icons/vsc";

export const SOCIALS: Social[] = [
  {
    name: "Facebook",
    icon: <TiSocialFacebookCircular size={28} />,
    url: "https://www.facebook.com/ipondnakab",
  },
  {
    name: "LinkedIn",
    icon: <TiSocialLinkedinCircular size={28} />,
    url: "https://www.linkedin.com/in/kittipat-dd/",
  },
  {
    name: "Github",
    icon: <VscGithub size={22} />,
    url: "https://github.com/ipondnakab",
  },
  {
    name: "Medium",
    icon: <AiFillMediumCircle size={24} />,
    url: "https://medium.com/@kittipat_dd",
  },
];
