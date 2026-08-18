import { Menu } from "@/shared/types/menu";

export const NAV_MENUS: Menu[] = [
  {
    name: "home",
    title: "README",
    href: "/",
  },
  {
    name: "resume",
    title: "RESUME",
    href: "/resume",
  },
  // {
  //   name: "demo",
  //   title: "DEMO",
  //   href: "/demo",
  // },
  {
    name: "contact",
    title: "CONTACT",
    href: "/contact",
  },
  {
    name: "mini-project",
    title: "MINI-PROJECT",
    href: "/mini-project",
  },
  {
    name: "planning",
    title: "PLANNING",
    href: "/planning",
  },
  {
    name: "credit",
    title: "CREDIT",
    href: "/credit",
  },
] as const;
