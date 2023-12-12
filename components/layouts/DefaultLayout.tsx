"use client";
import {
  Divider,
  Link,
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import React from "react";
import CatLogo from "../Logo/CatLogo";
import { ThemeSwitcher } from "@/components/layouts/ThemeSwitcher";
import clsx from "clsx";
import BackgroundParticles from "./BackgroundParticles";
import AnimationSwitcher from "./AnimationSwitcher";
import { usePathname } from "next/navigation";
import { SOCIALS } from "@/constants/social";
import { NAV_MENUS } from "@/constants/nav-menu";

export interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showAnimation, setShowAnimation] = React.useState(true);
  const pathname = usePathname();

  const isShowAnimation = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 640;
    }
    return false;
  }, []);

  return (
    <>
      <div>
        <Navbar maxWidth="full" onMenuOpenChange={setIsMenuOpen}>
          <NavbarContent className="gap-2 py-4">
            <NavbarMenuToggle
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="sm:hidden"
            />
            <div className="group flex cursor-pointer">
              <p
                className={clsx(
                  "group-hover:w-24 text-lg sm:text-xl text-inherit tracking-[0.15rem] text-primary w-0 line-clamp-1 overflow-hidden transition-all duration-300",
                )}
              >
                KITTIPAT
              </p>
              <Divider orientation="vertical" />
              <CatLogo />
            </div>
            <Divider orientation="vertical" className="hidden md:flex" />
            <div className="hidden gap-2 sm:flex">
              {NAV_MENUS.map((item, index) => (
                <NavbarItem
                  key={`${item.name}-${index}`}
                  isActive={pathname === item.href}
                >
                  <Link
                    className={clsx(
                      "border-b-0 hover:border-b-2 transition-all ",
                      pathname === item.href && "border-primary",
                    )}
                    color={pathname === item.href ? "primary" : "foreground"}
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </NavbarItem>
              ))}
            </div>
          </NavbarContent>

          <div className="flex items-center justify-end h-8 gap-2">
            {SOCIALS.map((socialLink) => (
              <NavbarItem className="hidden md:flex" key={socialLink.name}>
                <Link
                  href={socialLink.url}
                  color="foreground"
                  className="hover:text-primary transition-all duration-300"
                  target="_blank"
                >
                  {socialLink.icon}
                </Link>
              </NavbarItem>
            ))}
            <Divider orientation="vertical" className="hidden md:flex" />
            <div className="flex items-center justify-center gap-1">
              <ThemeSwitcher disableLabelAnimation={isShowAnimation} />
              <div className="hidden sm:flex">
                <AnimationSwitcher
                  show={showAnimation}
                  setShow={setShowAnimation}
                />
              </div>
            </div>
          </div>
          <NavbarMenu>
            {NAV_MENUS.map((item, index) => (
              <NavbarMenuItem
                key={`${item.name}-${index}`}
                isActive={pathname === item.href}
              >
                <Link
                  color={pathname === item.href ? "primary" : "foreground"}
                  className="w-full"
                  href={item.href}
                  size="lg"
                >
                  {item.title}
                </Link>
              </NavbarMenuItem>
            ))}
            <Divider />
            <div className="flex items-center pt-4 justify-center">
              <AnimationSwitcher
                show={showAnimation}
                setShow={setShowAnimation}
                disableLabelAnimation
              />
            </div>
          </NavbarMenu>
        </Navbar>
        <div className="z-20">{children}</div>
      </div>
      {showAnimation && <BackgroundParticles />}
    </>
  );
};

export default DefaultLayout;
