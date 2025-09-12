"use client";

import React, { useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

type ServicePackage = {
  name: string;
  price: string;
  description: string;
};

interface CreatorPackagesProps {
  uid: string;
}

export default function CreatorPackages({ uid }: CreatorPackagesProps) {
  console.log('📦 CreatorPackages loading for UID:', uid);
  const t = useTranslations("creator.profilePage.packages");
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      if (!uid) return;
      
      try {
        setLoading(true);
        console.log('🔥 Fetching packages for user:', uid);
        
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('📄 Full user document:', userData);
          const servicePackages = userData.servicePackages || [];
          
          console.log('✅ Found packages:', servicePackages);
          console.log('📊 Number of packages:', servicePackages.length);
          setPackages(servicePackages);
        } else {
          console.log('❌ User document not found');
          setError('User not found');
        }
      } catch (error) {
        console.error('❌ Error fetching packages:', error);
        setError('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [uid]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border border-red-burgundy/10 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-burgundy/10">
            <SparklesIcon className="h-5 w-5 text-red-burgundy" />
          </span>
          <h3 className="text-2xl font-serif font-bold text-text">{t("title")}</h3>
        </div>
        <div className="animate-pulse space-y-5">
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border border-red-burgundy/10 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-burgundy/10">
            <SparklesIcon className="h-5 w-5 text-red-burgundy" />
          </span>
          <h3 className="text-2xl font-serif font-bold text-text">{t("title")}</h3>
        </div>
        <p className="text-gray-500 text-center py-8">{error}</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border border-red-burgundy/10 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-burgundy/10">
            <SparklesIcon className="h-5 w-5 text-red-burgundy" />
          </span>
          <h3 className="text-2xl font-serif font-bold text-text">{t("title")}</h3>
        </div>
        <p className="text-gray-500 text-center py-8">No packages available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-red-burgundy/10 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-burgundy/10">
          <SparklesIcon className="h-5 w-5 text-red-burgundy" />
        </span>
        <h3 className="text-2xl font-serif font-bold text-text">{t("title")}</h3>
      </div>

      <div className="space-y-5">
        {packages.map((pkg, index) => (
          <div key={index} className="rounded-2xl border border-red-burgundy/10 bg-gradient-to-r from-red-burgundy/5 to-red-burgundy/10 p-5">
          <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-serif font-semibold text-gray-900">
                    {pkg.name}
                  </h4>
                  <span className="text-lg font-bold text-red-burgundy">
                    PLN {pkg.price}
                  </span>
            </div>
                <p className="text-sm text-subtext leading-relaxed">
                  {pkg.description}
                </p>
        </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 