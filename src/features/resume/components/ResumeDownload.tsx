"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineDownload } from "react-icons/hi";

import {
  RESUME_DOWNLOAD_FILENAME,
  RESUME_PDF_URL,
} from "@/features/resume/constants/download";
import { trackEvent } from "@/shared/lib/analytics";

export interface ResumeDownloadProps {}

const ResumeDownload: React.FC<ResumeDownloadProps> = () => {
  const { t } = useTranslation();

  return (
    <a
      href={RESUME_PDF_URL}
      download={RESUME_DOWNLOAD_FILENAME}
      onClick={() =>
        trackEvent("resume_download_click", {
          file_name: RESUME_DOWNLOAD_FILENAME,
        })
      }
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-center font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <HiOutlineDownload aria-hidden="true" className="shrink-0 text-lg" />
      {t("resume.action.download")}
    </a>
  );
};

export default ResumeDownload;
