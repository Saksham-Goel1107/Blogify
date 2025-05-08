"use client";

import { useTheme } from "../actions/DarkMode";
import { ArrowRight } from "lucide-react";

export default function TermsOfUse() {
  const { darkMode } = useTheme();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using Blogify, you agree to be bound by these Terms of Use. If you do not agree to any part of these terms, you must discontinue use of our services immediately.`
    },
    {
      title: "2. User Accounts",
      content: [
        "Users must provide accurate and complete information when registering for an account.",
        "Users are responsible for maintaining the confidentiality and security of their account credentials.",
        "Users may not share their login information with third parties or allow others to access their accounts.",
        "Blogify reserves the right to suspend or terminate accounts found to be in violation of our policies."
      ]
    },
    {
      title: "3. Content Guidelines",
      content: [
        "You agree not to post or share content that is illegal, harmful, abusive, defamatory, obscene, or otherwise objectionable.",
        "You retain ownership of your content but grant Blogify a non-exclusive license to use, display, reproduce, and distribute it across the platform.",
        "Content that infringes on intellectual property rights, including copyright and trademarks, is strictly prohibited.",
        "We reserve the right to moderate, edit, or remove content that violates our guidelines."
      ]
    },
    {
      title: "4. Privacy",
      content: `Your privacy is important to us. Our data practices are outlined in our Privacy Policy. By using Blogify, you consent to the collection, storage, and use of your personal data in accordance with that policy.`
    },
    {
      title: "5. Acceptable Use",
      content: [
        "Users may not use Blogify for any unlawful or unauthorized purpose.",
        "Attempts to gain unauthorized access to the platform or its systems are strictly prohibited.",
        "You may not disrupt or interfere with the performance of the platform or other users’ experience.",
        "Harvesting or collecting personal information of others without their consent is not permitted."
      ]
    },
    {
      title: "6. Content Moderation",
      content: [
        "Blogify retains the right to moderate content submitted to the platform.",
        "We may remove or flag content that violates these Terms or is deemed inappropriate.",
        "Users are encouraged to report content that may breach our guidelines.",
        "Our moderation decisions are final and at our sole discretion."
      ]
    },
    {
      title: "7. Intellectual Property",
      content: `All trademarks, logos, and service marks displayed on Blogify are the property of Blogify or third-party licensors. Unauthorized use is strictly prohibited.`
    },
    {
      title: "8. Limitation of Liability",
      content: `Blogify is provided "as is" and "as available" without any warranties. We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform.`
    },
    {
      title: "9. Changes to Terms",
      content: `We reserve the right to modify or replace these Terms of Use at any time. Changes will be effective immediately upon posting. Continued use of Blogify constitutes acceptance of the revised terms.`
    },
    {
      title: "10. Termination",
      content: `We may terminate or suspend access to Blogify without notice or liability for behavior that violates these terms or is otherwise harmful.`
    }
  ];

  return (
    <main
      className={`min-h-screen pt-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <section
          className={`rounded-xl p-6 sm:p-10 shadow-2xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
              Terms of Use
            </h1>
            <p
              className={`mt-4 text-lg ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </header>

          <article className="space-y-10">
            {sections.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2
                  className={`text-2xl font-bold ${
                    darkMode ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {section.title}
                </h2>
                {Array.isArray(section.content) ? (
                  <ul className="space-y-3 pl-2 sm:pl-4">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <ArrowRight
                          size={18}
                          className={`mt-1 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-base leading-relaxed ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className={`text-base leading-relaxed ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {section.content}
                  </p>
                )}
              </section>
            ))}
          </article>

          <footer
            className={`mt-16 rounded-lg p-6 sm:p-8 ${
              darkMode ? "bg-gray-700/60" : "bg-gray-100"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Contact Us
            </h2>
            <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
              For any questions regarding these Terms of Use, feel free to contact us at{" "}
              <a
                href="mailto:sakshamgoel1107@gmail.com"
                className="text-blue-500 hover:text-blue-600 font-medium underline underline-offset-2"
              >
                sakshamgoel1107@gmail.com
              </a>
              . We aim to respond within 2–3 business days.
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
