"use client";

import React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export default function CreatorPackages() {
  const t = useTranslations("creator.profilePage.packages");

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-red-burgundy/10 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-burgundy/10">
          <SparklesIcon className="h-5 w-5 text-red-burgundy" />
        </span>
        <h3 className="text-2xl font-serif font-bold text-text">{t("title")}</h3>
      </div>

      <div className="space-y-5">
        {/* Mini Social Boost */}
        <div className="rounded-2xl border border-red-burgundy/10 bg-gradient-to-r from-red-burgundy/5 to-red-burgundy/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-lg font-serif font-semibold text-gray-900">{t("mini.title")}</h4>
              <ul className="mt-2 text-sm text-subtext list-disc pl-5 space-y-1">
                <li>{t("mini.bullets.stories")}</li>
                <li>{t("mini.bullets.tagging")}</li>
                <li>{t("mini.bullets.delivery")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content Impact */}
        <div className="rounded-2xl border border-red-burgundy/10 bg-gradient-to-r from-red-burgundy/5 to-red-burgundy/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-lg font-serif font-semibold text-gray-900">{t("content.title")}</h4>
              <ul className="mt-2 text-sm text-subtext list-disc pl-5 space-y-1">
                <li>{t("content.bullets.video")}</li>
                <li>{t("content.bullets.story")}</li>
                <li>{t("content.bullets.editing")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Full Campaign Package */}
        <div className="rounded-2xl border border-red-burgundy/10 bg-gradient-to-r from-red-burgundy/5 to-red-burgundy/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-lg font-serif font-semibold text-gray-900">{t("full.title")}</h4>
              <ul className="mt-2 text-sm text-subtext list-disc pl-5 space-y-1">
                <li>{t("full.bullets.reelsTikTok")}</li>
                <li>{t("full.bullets.stories")}</li>
                <li>{t("full.bullets.versions")}</li>
                <li>{t("full.bullets.delivery")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-red-burgundy/20 p-4 bg-red-burgundy/5 text-sm text-subtext">
        {t("photosComingSoon")}
      </div>
    </div>
  );
} 