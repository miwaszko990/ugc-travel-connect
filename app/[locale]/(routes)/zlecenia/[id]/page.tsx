"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/hooks/auth';
import { Job } from '@/app/lib/types';
import { getJob } from '@/app/lib/firebase/jobs';
import { createApplication, hasCreatorApplied } from '@/app/lib/firebase/applications';
import {
  MapPinIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Navigation from '@/app/components/ui/navigation';

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const [applicationData, setApplicationData] = useState({
    message: '',
    portfolioLink1: '',
    portfolioLink2: '',
    portfolioLink3: '',
  });

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  useEffect(() => {
    if (user?.uid && jobId && user.role === 'creator') {
      checkIfApplied();
    }
  }, [user?.uid, jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const jobData = await getJob(jobId);
      if (jobData) {
        setJob(jobData);
      } else {
        router.push('/zlecenia');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      router.push('/zlecenia');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    if (!user?.uid) return;
    
    try {
      const applied = await hasCreatorApplied(user.uid, jobId);
      setHasApplied(applied);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !job) return;

    try {
      setSubmitting(true);

      const portfolioLinks = [
        applicationData.portfolioLink1,
        applicationData.portfolioLink2,
        applicationData.portfolioLink3,
      ].filter((link) => link.trim());

      await createApplication(
        jobId,
        user.uid,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Twórca',
        {
          message: applicationData.message,
          portfolioLinks,
          creatorProfileUrl: user.profileImageUrl,
          creatorInstagram: user.instagramHandle,
        }
      );

      setApplicationSuccess(true);
      setHasApplied(true);
      setTimeout(() => {
        setShowApplicationForm(false);
        setApplicationSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Wystąpił błąd podczas wysyłania aplikacji');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8D2D26]"></div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const isCreator = user?.role === 'creator';
  const canApply = isCreator && !hasApplied && job.status === 'open';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCF9] to-[#F9F4F2]">
      {/* Navigation Bar */}
      <Navigation sticky={true} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/zlecenia"
          className="inline-flex items-center text-[#8D2D26] hover:underline mb-8 mt-4"
        >
          ← Wróć do listy zleceń
        </Link>

        {/* Job Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#8D2D26]/5 to-[#8D2D26]/10 p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {job.brandLogoUrl ? (
                  <img
                    src={job.brandLogoUrl}
                    alt={job.brandName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#8D2D26]/20 flex items-center justify-center">
                    <span className="text-[#8D2D26] font-semibold text-xl">
                      {job.brandName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-gray-600">{job.brandName}</p>
                  {job.category && (
                    <span className="inline-block mt-1 px-3 py-1 text-xs bg-white rounded-full text-[#8D2D26]">
                      {getCategoryLabel(job.category)}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  job.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {job.status === 'open' ? 'Aktywne' : 'Zamknięte'}
              </span>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {job.budget && (
                <div className="flex items-center gap-2 text-gray-700">
                  <BanknotesIcon className="w-5 h-5 text-[#8D2D26]" />
                  <div>
                    <div className="text-xs text-gray-600">Budżet</div>
                    <div className="font-semibold">
                      {job.budget.min === job.budget.max
                        ? `${job.budget.min} PLN`
                        : `${job.budget.min}-${job.budget.max} PLN`}
                    </div>
                  </div>
                </div>
              )}
              {job.location && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPinIcon className="w-5 h-5 text-[#8D2D26]" />
                  <div>
                    <div className="text-xs text-gray-600">Lokalizacja</div>
                    <div className="font-semibold">{job.location}</div>
                  </div>
                </div>
              )}
              {job.deadline && (
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarIcon className="w-5 h-5 text-[#8D2D26]" />
                  <div>
                    <div className="text-xs text-gray-600">Termin</div>
                    <div className="font-semibold">{formatDate(job.deadline)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Opis zlecenia</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Wymagania</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-[#8D2D26] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deliverables */}
            {job.deliverables && job.deliverables.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Oczekiwane materiały
                </h2>
                <ul className="space-y-2">
                  {job.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-[#8D2D26] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Applications Info */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {job.applicationsCount || 0} aplikacji do tego zlecenia
              </p>
            </div>

            {/* Apply Button */}
            {canApply && (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full py-3 bg-[#8D2D26] text-white rounded-xl hover:opacity-95 transition font-medium"
              >
                Aplikuj na to zlecenie
              </button>
            )}

            {hasApplied && isCreator && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
                ✓ Już zaaplikowałeś/aś na to zlecenie
              </div>
            )}

            {!isCreator && user && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-center">
                Tylko twórcy mogą aplikować na zlecenia
              </div>
            )}

            {!user && (
              <div className="p-4 bg-[#8D2D26]/10 border border-[#8D2D26]/20 rounded-xl text-center">
                <p className="text-gray-800 font-medium mb-3">
                  Zaloguj się jako twórca, aby aplikować na to zlecenie
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/auth/login"
                    className="px-6 py-2 bg-white text-[#8D2D26] border border-[#8D2D26] rounded-lg hover:bg-[#8D2D26] hover:text-white transition font-medium"
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 bg-[#8D2D26] text-white rounded-lg hover:opacity-90 transition font-medium"
                  >
                    Zarejestruj się
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#8D2D26]">
                Aplikuj na zlecenie
              </h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aplikacja wysłana!
                </h3>
                <p className="text-gray-600">
                  Marka wkrótce przejrzy Twoją aplikację
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wiadomość do marki *
                  </label>
                  <textarea
                    required
                    value={applicationData.message}
                    onChange={(e) =>
                      setApplicationData({ ...applicationData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                    placeholder="Opisz dlaczego jesteś idealnym twórcą do tego zlecenia..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio / Linki (opcjonalnie)
                  </label>
                  <input
                    type="url"
                    value={applicationData.portfolioLink1}
                    onChange={(e) =>
                      setApplicationData({
                        ...applicationData,
                        portfolioLink1: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none mb-2"
                    placeholder="https://instagram.com/..."
                  />
                  <input
                    type="url"
                    value={applicationData.portfolioLink2}
                    onChange={(e) =>
                      setApplicationData({
                        ...applicationData,
                        portfolioLink2: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none mb-2"
                    placeholder="https://..."
                  />
                  <input
                    type="url"
                    value={applicationData.portfolioLink3}
                    onChange={(e) =>
                      setApplicationData({
                        ...applicationData,
                        portfolioLink3: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-[#8D2D26] text-white rounded-xl hover:opacity-95 transition disabled:opacity-50"
                  >
                    {submitting ? 'Wysyłanie...' : 'Wyślij aplikację'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

