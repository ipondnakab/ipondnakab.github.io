"use client";

import { Card } from "@nextui-org/react";
import React, { useState } from "react";

export interface DrunkardGamePrivacyProps {}

const DrunkardGamePrivacy: React.FC<DrunkardGamePrivacyProps> = () => {
  const [language, setLanguage] = useState<"th" | "en">("th");

  const content = {
    th: {
      title: "นโยบายความเป็นส่วนตัว",
      lastUpdated: "อัปเดตล่าสุด",
      overview: {
        title: "ภาพรวม",
        content:
          'แอป Drunkard Party ("แอป", "เรา", "ของเรา") ให้ความสำคัญกับความเป็นส่วนตัวของคุณ นโยบายความเป็นส่วนตัวนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลของคุณเมื่อคุณใช้แอปพลิเคชันมือถือของเรา',
      },
      dataCollection: {
        title: "ข้อมูลที่เราเก็บรวบรวม",
        localData: {
          title: "1. ข้อมูลที่เก็บในเครื่อง",
          content: "แอปของเราเก็บข้อมูลต่อไปนี้ในอุปกรณ์ของคุณเท่านั้น:",
          items: [
            "ข้อมูลความคืบหน้าของเกม (คะแนน, สถิติ)",
            "การตั้งค่าของแอป (ธีม, การตั้งค่าเสียง)",
            "ข้อมูลเกมที่บันทึกไว้ (King's Cup, Heads Up, Slot Machine)",
          ],
          warning:
            "⚠️ ข้อมูลเหล่านี้จะไม่ถูกส่งไปยังเซิร์ฟเวอร์หรือบุคคลที่สาม",
        },
        admob: {
          title: "2. ข้อมูลจาก Google AdMob",
          content:
            "แอปของเราใช้ Google AdMob เพื่อแสดงโฆษณา Google อาจเก็บรวบรวมข้อมูลต่อไปนี้:",
          items: [
            "ตัวระบุโฆษณา (Advertising ID)",
            "ข้อมูลอุปกรณ์ (รุ่น, ระบบปฏิบัติการ)",
            "ข้อมูลการใช้งานแอป",
            "ที่อยู่ IP",
          ],
          policy: "โปรดดูนโยบายความเป็นส่วนตัวของ Google AdMob ได้ที่:",
        },
      },
      permissions: {
        title: "สิทธิ์ที่แอปขอใช้",
        content: "แอปของเราขอสิทธิ์ต่อไปนี้เพื่อการทำงานที่สมบูรณ์:",
        items: [
          {
            name: "อินเทอร์เน็ต (INTERNET)",
            desc: "สำหรับแสดงโฆษณาและตรวจสอบการอัปเดต",
          },
          {
            name: "สถานะเครือข่าย (ACCESS_NETWORK_STATE)",
            desc: "ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
          },
          { name: "การสั่น (VIBRATE)", desc: "สำหรับ Haptic Feedback ในเกม" },
          {
            name: "เซ็นเซอร์ (Accelerometer)",
            desc: "สำหรับเกม Heads Up ที่ใช้การเอียงหน้าจอ",
          },
        ],
      },
      usage: {
        title: "วิธีที่เราใช้ข้อมูล",
        content: "เราใช้ข้อมูลที่เก็บรวบรวมเพื่อ:",
        items: [
          "ให้บริการฟีเจอร์ของเกม",
          "บันทึกความคืบหน้าและการตั้งค่าของคุณ",
          "แสดงโฆษณาที่เกี่ยวข้อง (ผ่าน Google AdMob)",
          "ปรับปรุงประสบการณ์การใช้งานแอป",
        ],
      },
      sharing: {
        title: "การแบ่งปันข้อมูล",
        content:
          "เราไม่ขาย แลกเปลี่ยน หรือแบ่งปันข้อมูลส่วนบุคคลของคุณกับบุคคลที่สาม ยกเว้นในกรณีต่อไปนี้:",
        items: [
          {
            name: "Google AdMob",
            desc: "สำหรับแสดงโฆษณา (ตามนโยบายของ Google)",
          },
          { name: "ตามกฎหมาย", desc: "เมื่อมีข้อกำหนดทางกฎหมายที่ต้องเปิดเผย" },
        ],
      },
      security: {
        title: "ความปลอดภัยของข้อมูล",
        content:
          "เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ อย่างไรก็ตาม การส่งข้อมูลผ่านอินเทอร์เน็ตไม่สามารถรับประกันความปลอดภัย 100% ได้",
      },
      rights: {
        title: "สิทธิ์ของคุณ",
        content: "คุณมีสิทธิ์ในการ:",
        items: [
          "เข้าถึงข้อมูลที่เก็บไว้ในอุปกรณ์ของคุณ",
          'ลบข้อมูลเกมผ่านฟีเจอร์ "รีเซ็ตเกม" ในหน้าการตั้งค่า',
          "ถอนการยินยอมให้ใช้สิทธิ์ต่างๆ ผ่านการตั้งค่าอุปกรณ์",
          "ปิดการติดตามโฆษณา (Ad Tracking) ผ่านการตั้งค่าอุปกรณ์",
        ],
      },
      children: {
        title: "เด็กและผู้เยาว์",
        content:
          "แอปนี้มีไว้สำหรับผู้ใช้ที่มีอายุ 18 ปีขึ้นไปเท่านั้น เนื่องจากมีเนื้อหาเกี่ยวกับเครื่องดื่มแอลกอฮอล์ เราไม่ได้มีเจตนาเก็บรวบรวมข้อมูลจากเด็กอายุต่ำกว่า 18 ปี",
      },
      changes: {
        title: "การเปลี่ยนแปลงนโยบาย",
        content:
          "เราอาจอัปเดตนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว การเปลี่ยนแปลงจะมีผลทันทีเมื่อเผยแพร่บนหน้านี้ เราแนะนำให้คุณตรวจสอบนโยบายนี้เป็นระยะๆ",
      },
      contact: {
        title: "การติดต่อเรา",
        content:
          "หากคุณมีคำถามหรือข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเราได้ที่:",
        email: "อีเมล",
        website: "เว็บไซต์",
      },
      footer: {
        app: "เกมสังสรรค์สุดมันส์",
        copyright: "สงวนลิขสิทธิ์",
        warning: "โปรดดื่มอย่างรับผิดชอบ | สำหรับผู้ใหญ่ 18+ เท่านั้น",
      },
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated",
      overview: {
        title: "Overview",
        content:
          'Drunkard Party ("App", "we", "our") values your privacy. This privacy policy explains how we collect, use, and protect your information when you use our mobile application.',
      },
      dataCollection: {
        title: "Information We Collect",
        localData: {
          title: "1. Local Storage Data",
          content: "Our app stores the following data on your device only:",
          items: [
            "Game progress data (scores, statistics)",
            "App settings (theme, sound settings)",
            "Saved game data (King's Cup, Heads Up, Slot Machine)",
          ],
          warning:
            "⚠️ This data is never sent to external servers or third parties",
        },
        admob: {
          title: "2. Google AdMob Data",
          content:
            "Our app uses Google AdMob to display advertisements. Google may collect the following:",
          items: [
            "Advertising ID",
            "Device information (model, operating system)",
            "App usage data",
            "IP address",
          ],
          policy: "Please review Google AdMob's privacy policy at:",
        },
      },
      permissions: {
        title: "Permissions We Request",
        content:
          "Our app requests the following permissions for full functionality:",
        items: [
          {
            name: "Internet (INTERNET)",
            desc: "For displaying ads and checking updates",
          },
          {
            name: "Network State (ACCESS_NETWORK_STATE)",
            desc: "To check internet connectivity",
          },
          { name: "Vibrate (VIBRATE)", desc: "For haptic feedback in games" },
          {
            name: "Sensors (Accelerometer)",
            desc: "For Heads Up game using screen tilt",
          },
        ],
      },
      usage: {
        title: "How We Use Information",
        content: "We use the collected information to:",
        items: [
          "Provide game features",
          "Save your progress and settings",
          "Display relevant advertisements (via Google AdMob)",
          "Improve app user experience",
        ],
      },
      sharing: {
        title: "Data Sharing",
        content:
          "We do not sell, trade, or share your personal information with third parties, except in the following cases:",
        items: [
          {
            name: "Google AdMob",
            desc: "For displaying advertisements (per Google's policies)",
          },
          {
            name: "Legal Requirements",
            desc: "When legally required to disclose",
          },
        ],
      },
      security: {
        title: "Data Security",
        content:
          "We use appropriate security measures to protect your data. However, no internet transmission can be guaranteed to be 100% secure.",
      },
      rights: {
        title: "Your Rights",
        content: "You have the right to:",
        items: [
          "Access data stored on your device",
          'Delete game data via "Reset Game" feature in settings',
          "Revoke permissions through device settings",
          "Disable ad tracking through device settings",
        ],
      },
      children: {
        title: "Children and Minors",
        content:
          "This app is intended for users 18 years and older only, as it contains alcohol-related content. We do not intentionally collect data from children under 18.",
      },
      changes: {
        title: "Policy Changes",
        content:
          "We may update this privacy policy from time to time. Changes will take effect immediately upon posting on this page. We recommend reviewing this policy periodically.",
      },
      contact: {
        title: "Contact Us",
        content:
          "If you have questions or concerns about this privacy policy, please contact us at:",
        email: "Email",
        website: "Website",
      },
      footer: {
        app: "Fun Party Games",
        copyright: "All rights reserved",
        warning: "Please drink responsibly | For adults 18+ only",
      },
    },
  };

  const t = content[language];

  return (
    <Card isBlurred className="m-12 relative p-8 gap-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Language Toggle */}
        <div className="flex justify-end mb-8">
          <Card isBlurred className="flex gap-2 flex-row rounded-md p-2">
            <button
              onClick={() => setLanguage("th")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === "th"
                  ? "bg-foreground-50 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              🇹🇭 ไทย
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === "en"
                  ? "bg-foreground-50 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              🇬🇧 English
            </button>
          </Card>
        </div>

        {/* Header */}
        <Card isBlurred className="p-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>{t.lastUpdated}:</strong>{" "}
            {language === "th" ? "19 มกราคม 2026" : "January 19, 2026"}
          </p>
        </Card>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Overview */}
          <Section title={t.overview.title}>
            <p className="text-gray-700 dark:text-gray-300">
              {t.overview.content}
            </p>
          </Section>

          {/* Data Collection */}
          <Section title={t.dataCollection.title}>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t.dataCollection.localData.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {t.dataCollection.localData.content}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  {t.dataCollection.localData.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                    {t.dataCollection.localData.warning}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {t.dataCollection.admob.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {t.dataCollection.admob.content}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  {t.dataCollection.admob.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  {t.dataCollection.admob.policy}{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    https://policies.google.com/privacy
                  </a>
                </p>
              </div>
            </div>
          </Section>

          {/* Permissions */}
          <Section title={t.permissions.title}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t.permissions.content}
            </p>
            <div className="space-y-3">
              {t.permissions.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-purple-600 dark:text-purple-300 text-xs">
                      ✓
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">
                      {item.name}:
                    </strong>{" "}
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Usage */}
          <Section title={t.usage.title}>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {t.usage.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              {t.usage.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* Sharing */}
          <Section title={t.sharing.title}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t.sharing.content}
            </p>
            <div className="space-y-3">
              {t.sharing.items.map((item, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <strong className="text-gray-900 dark:text-white">
                    {item.name}:
                  </strong>{" "}
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Security */}
          <Section title={t.security.title}>
            <p className="text-gray-700 dark:text-gray-300">
              {t.security.content}
            </p>
          </Section>

          {/* Rights */}
          <Section title={t.rights.title}>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {t.rights.content}
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              {t.rights.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* Children */}
          <Section title={t.children.title}>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded">
              <p className="text-red-800 dark:text-red-200">
                {t.children.content}
              </p>
            </div>
          </Section>

          {/* Changes */}
          <Section title={t.changes.title}>
            <p className="text-gray-700 dark:text-gray-300">
              {t.changes.content}
            </p>
          </Section>

          {/* Contact */}
          <Section title={t.contact.title}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t.contact.content}
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <strong className="text-gray-900 dark:text-white">
                      {t.contact.website}:
                    </strong>{" "}
                    <a
                      href="https://ipondnakab.github.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      https://ipondnakab.github.io
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💻</span>
                  <div>
                    <strong className="text-gray-900 dark:text-white">
                      GitHub:
                    </strong>{" "}
                    <a
                      href="https://github.com/ipondnakab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      @ipondnakab
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-2">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              🎉 Drunkard Party - {t.footer.app}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              © 2026 ipondnakab. {t.footer.copyright}.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t.footer.warning}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DrunkardGamePrivacy;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card isBlurred className=" p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div>{children}</div>
    </Card>
  );
}
