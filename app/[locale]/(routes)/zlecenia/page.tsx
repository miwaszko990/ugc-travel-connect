"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Job } from '@/app/lib/types';
import { getOpenJobs } from '@/app/lib/firebase/jobs';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BanknotesIcon,
  CalendarIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Navigation from '@/app/components/ui/navigation';

export default function JobBoardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchTerm, selectedCategory, selectedLocation]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const openJobs = await getOpenJobs();
      setJobs(openJobs);
      setFilteredJobs(openJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((job) => job.category === selectedCategory);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter((job) =>
        job.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      photo: 'Zdjęcia',
      video: 'Wideo',
      reel: 'Reels/Stories',
      post: 'Post sponsorowany',
      review: 'Recenzja',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCF9] to-[#F9F4F2]">
      {/* Navigation Bar */}
      <Navigation sticky={true} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#8D2D26]/5 to-[#8D2D26]/10 border-b border-gray-200 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#8D2D26] mb-4">
              Znajdź Zlecenia dla Twórców
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Przeglądaj aktualne zlecenia od marek i aplikuj na te, które Cię interesują
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj zleceń..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                >
                  <option value="">Wszystkie kategorie</option>
                  <option value="photo">Zdjęcia</option>
                  <option value="video">Wideo</option>
                  <option value="reel">Reels/Stories</option>
                  <option value="post">Post sponsorowany</option>
                  <option value="review">Recenzja</option>
                </select>

                <input
                  type="text"
                  placeholder="Lokalizacja"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2D26]"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Brak zleceń
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory || selectedLocation
                ? 'Nie znaleziono zleceń spełniających kryteria wyszukiwania'
                : 'Obecnie brak dostępnych zleceń'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/zlecenia/${job.id}`}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Brand Info */}
                <div className="flex items-center gap-3 mb-4">
                  {job.brandLogoUrl ? (
                    <img
                      src={job.brandLogoUrl}
                      alt={job.brandName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#8D2D26]/10 flex items-center justify-center">
                      <span className="text-[#8D2D26] font-semibold">
                        {job.brandName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.brandName}</h3>
                    {job.category && (
                      <span className="text-xs text-gray-600">
                        {getCategoryLabel(job.category)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Title */}
                <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {job.title}
                </h2>

                {/* Job Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  {job.budget && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <BanknotesIcon className="w-4 h-4 text-[#8D2D26]" />
                      <span>
                        {job.budget.min === job.budget.max
                          ? `${job.budget.min} PLN`
                          : `${job.budget.min}-${job.budget.max} PLN`}
                      </span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPinIcon className="w-4 h-4 text-[#8D2D26]" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CalendarIcon className="w-4 h-4 text-[#8D2D26]" />
                      <span>Do: {formatDate(job.deadline)}</span>
                    </div>
                  )}
                </div>

                {/* Applications Count */}
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-600">
                    {job.applicationsCount || 0} aplikacji
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

