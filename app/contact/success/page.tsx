"use client";

import { Button, Card } from "@nextui-org/react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { HiOutlineHome } from "react-icons/hi";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdOutlineForum } from "react-icons/md";

const ContactSendSuccess = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex w-full items-center justify-center p-4 py-16 sm:py-24">
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Card isBlurred className="items-center gap-5 p-8 text-center">
          <motion.div
            initial={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
            animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <IoCheckmarkCircle className="text-7xl text-primary" />
          </motion.div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{t("contact.successTitle")}</h1>
            <p className="text-small text-default-600">
              {t("contact.successMessage")}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-tiny text-default-500">
            <MdOutlineForum className="shrink-0" />
            <span>{t("contact.responseNote")}</span>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              as={Link}
              href="/"
              variant="bordered"
              className="flex-1"
              startContent={<HiOutlineHome />}
            >
              {t("contact.backHome")}
            </Button>
            <Button
              as={Link}
              href="/contact"
              color="primary"
              className="flex-1 font-semibold"
            >
              {t("contact.sendAgain")}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContactSendSuccess;
