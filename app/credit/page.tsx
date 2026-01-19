import { Card } from "@nextui-org/react";
import React from "react";

const CreditPage: React.FC = () => {
  return (
    <div className="flex flex-col p-2 gap-4 sm:gap-8 sm:p-8">
      <Card isBlurred className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Credits & Acknowledgments
          </h1>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center">
            This project wouldn&apos;t be possible without these amazing
            open-source libraries and tools. Thank you to all the maintainers
            and contributors!
          </p>

          <div className="space-y-8">
            <Card isBlurred className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Core Framework
              </h2>
              <ul className="space-y-3">
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Next.js</strong> - The React Framework for Production
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>React</strong> - A JavaScript library for building
                  user interfaces
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>TypeScript</strong> - Typed JavaScript at Any Scale
                </li>
              </ul>
            </Card>

            <Card isBlurred className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Styling & UI
              </h2>
              <ul className="space-y-3">
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Tailwind CSS</strong> - A utility-first CSS framework
                </li>
              </ul>
            </Card>

            <Card isBlurred className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Deployment
              </h2>
              <ul className="space-y-3">
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>GitHub Pages</strong> - Hosting from your GitHub
                  repository
                </li>
              </ul>
            </Card>
          </div>
          <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
            <p>Made with ❤️ using open source software</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreditPage;
