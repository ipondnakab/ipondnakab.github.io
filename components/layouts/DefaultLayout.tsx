"use client";
import {
  Divider,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import React from "react";
import CatLogo from "../Logo/CatLogo";
import { AiFillMediumCircle } from "react-icons/ai";
import {
  TiSocialLinkedinCircular,
  TiSocialFacebookCircular,
} from "react-icons/ti";
import { VscGithub } from "react-icons/vsc";
import { ThemeSwitcher } from "@/components/layouts/ThemeSwitcher";

export interface DefaultLayoutProps {
  children: React.ReactNode;
}

type SocialLinkProps = {
  icon: React.ReactElement;
  href: string;
};

const socialLinks: SocialLinkProps[] = [
  {
    icon: <TiSocialFacebookCircular size={28} />,
    href: "https://www.facebook.com/ipondnakab",
  },
  {
    icon: <TiSocialLinkedinCircular size={28} />,
    href: "https://www.linkedin.com/in/kittipat-dd/",
  },
  {
    icon: <VscGithub size={22} />,
    href: "https://github.com/ipondnakab",
  },
  {
    icon: <AiFillMediumCircle size={24} />,
    href: "https://medium.com/@kittipat_dd",
  },
];

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];
  return (
    <div>
      <Navbar maxWidth="full" onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand className="flex gap-4">
            <CatLogo />
            <p className="text-xl text-inherit tracking-[0.15rem]">KITTIPAT</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive>
            <Link href="/">HOME</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/demo" color="foreground" aria-current="page">
              DEMO
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end" className="py-3">
          {socialLinks.map((socialLink) => (
            <NavbarItem className="hidden lg:flex" key={socialLink.href}>
              <Link href={socialLink.href} color="foreground" target="_blank">
                {socialLink.icon}
              </Link>
            </NavbarItem>
          ))}
          <Divider orientation="vertical" className="hidden lg:flex" />
          <ThemeSwitcher />
        </NavbarContent>
        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === menuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                className="w-full"
                href="#"
                size="lg"
              >
                {item}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
      {children}
    </div>
  );
};

export default DefaultLayout;
