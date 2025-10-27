"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/auth';
import { Job } from '@/app/lib/types';
import {
  getBrandJobs,
  createJob,
  updateJob,
  archiveJob,
} from '@/app/lib/firebase/jobs';
import { getJobApplications } from '@/app/lib/firebase/applications';
import { 
  PlusIcon, 
  PencilIcon, 
  ArchiveBoxIcon,
  BriefcaseIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface JobFormData {
  title: string;
  description: string;
  budgetMin: string;
  budgetMax: string;
  location: string;
  category: string;
  deadline: string;
  requirements: string;
  deliverables: string;
}

export default function BrandJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    category: '',
    deadline: '',
    requirements: '',
    deliverables: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchJobs();
    }
  }, [user?.uid]);

  const fetchJobs = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching jobs for brand:', user.uid);
      const brandJobs = await getBrandJobs(user.uid);
      console.log('✅ Fetched jobs:', brandJobs);
      setJobs(brandJobs);
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      setSubmitting(true);
      
      const jobData = {
        title: formData.title,
        description: formData.description,
        budget: formData.budgetMin || formData.budgetMax ? {
          min: parseFloat(formData.budgetMin) || 0,
          max: parseFloat(formData.budgetMax) || 0,
          currency: 'PLN',
        } : undefined,
        location: formData.location || undefined,
        category: formData.category || undefined,
        deadline: formData.deadline || undefined,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : undefined,
        deliverables: formData.deliverables ? formData.deliverables.split('\n').filter(d => d.trim()) : undefined,
        status: 'open' as const,
      };

      console.log('💾 Creating job with brandId:', user.uid);
      console.log('💾 Job data:', jobData);

      if (editingJob) {
        await updateJob(editingJob.id, jobData);
        console.log('✅ Job updated');
      } else {
        const jobId = await createJob(
          user.uid,
          user.brandName || 'Marka',
          user.logoImageUrl,
          jobData
        );
        console.log('✅ Job created with ID:', jobId);
      }

      console.log('🔄 Refetching jobs...');
      await fetchJobs();
      resetForm();
    } catch (error) {
      console.error('❌ Error saving job:', error);
      alert('Wystąpił błąd podczas zapisywania zlecenia');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      budgetMin: job.budget?.min?.toString() || '',
      budgetMax: job.budget?.max?.toString() || '',
      location: job.location || '',
      category: job.category || '',
      deadline: job.deadline || '',
      requirements: job.requirements?.join('\n') || '',
      deliverables: job.deliverables?.join('\n') || '',
    });
    setShowForm(true);
  };

  const handleArchive = async (jobId: string) => {
    if (!confirm('Czy na pewno chcesz zarchiwizować to zlecenie?')) return;
    
    try {
      await archiveJob(jobId);
      await fetchJobs();
    } catch (error) {
      console.error('Error archiving job:', error);
      alert('Wystąpił błąd podczas archiwizowania zlecenia');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      budgetMin: '',
      budgetMax: '',
      location: '',
      category: '',
      deadline: '',
      requirements: '',
      deliverables: '',
    });
  };

  const viewApplications = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8D2D26]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#8D2D26]">Zlecenia</h1>
          <p className="text-gray-600 mt-1">Zarządzaj swoimi zleceniami dla twórców</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8D2D26] text-white rounded-xl hover:opacity-95 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Dodaj zlecenie
        </button>
      </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#8D2D26]">
                {editingJob ? 'Edytuj zlecenie' : 'Nowe zlecenie'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tytuł zlecenia *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                  placeholder="np. Tworzenie contentu z Krakowa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opis *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                  placeholder="Opisz szczegóły zlecenia..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budżet min (PLN)
                  </label>
                  <input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budżet max (PLN)
                  </label>
                  <input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                    placeholder="3000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokalizacja
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                    placeholder="Kraków"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                  >
                    <option value="">Wybierz kategorię</option>
                    <option value="photo">Zdjęcia</option>
                    <option value="video">Wideo</option>
                    <option value="reel">Reels/Stories</option>
                    <option value="post">Post sponsorowany</option>
                    <option value="review">Recenzja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Termin realizacji
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wymagania (każde w nowej linii)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                  placeholder="Min. 10k obserwujących&#10;Doświadczenie w travel content&#10;Portfolio z podobnych projektów"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oczekiwane materiały (każdy w nowej linii)
                </label>
                <textarea
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8D2D26]/20 focus:border-[#8D2D26] outline-none"
                  placeholder="10 zdjęć wysokiej jakości&#10;3 filmy Reels&#10;2 posty na Instagram"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#8D2D26] text-white rounded-xl hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? 'Zapisywanie...' : editingJob ? 'Zapisz zmiany' : 'Utwórz zlecenie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nie masz jeszcze żadnych zleceń</p>
            <p className="text-sm text-gray-500 mt-1">Utwórz pierwsze zlecenie, aby rozpocząć współpracę</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        job.status === 'open'
                          ? 'bg-green-100 text-green-700'
                          : job.status === 'closed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {job.status === 'open' ? 'Aktywne' : job.status === 'closed' ? 'Zamknięte' : 'Archiwum'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                {job.budget && (
                  <div>
                    <span className="text-gray-500">Budżet:</span>
                    <p className="font-medium text-gray-900">
                      {job.budget.min === job.budget.max
                        ? `${job.budget.min} PLN`
                        : `${job.budget.min}-${job.budget.max} PLN`}
                    </p>
                  </div>
                )}
                {job.location && (
                  <div>
                    <span className="text-gray-500">Lokalizacja:</span>
                    <p className="font-medium text-gray-900">{job.location}</p>
                  </div>
                )}
                {job.category && (
                  <div>
                    <span className="text-gray-500">Kategoria:</span>
                    <p className="font-medium text-gray-900">{job.category}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Aplikacje:</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    {job.applicationsCount || 0}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => viewApplications(job.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8D2D26] text-white rounded-xl hover:opacity-95 transition text-sm"
                >
                  <UserGroupIcon className="w-4 h-4" />
                  Zobacz aplikacje ({job.applicationsCount || 0})
                </button>
                {job.status !== 'archived' && (
                  <>
                    <button
                      onClick={() => handleEdit(job)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edytuj
                    </button>
                    <button
                      onClick={() => handleArchive(job.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
                    >
                      <ArchiveBoxIcon className="w-4 h-4" />
                      Archiwizuj
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Applications Modal */}
      {selectedJobId && (
        <ApplicationsModal
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
}

// Applications Modal Component
function ApplicationsModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apps = await getJobApplications(jobId);
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#8D2D26]">
            Aplikacje do zlecenia
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8D2D26]"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Brak aplikacji do tego zlecenia</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.creatorName}</h3>
                    {app.creatorInstagram && (
                      <p className="text-sm text-gray-600">@{app.creatorInstagram}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      app.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : app.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-700'
                        : app.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {app.status === 'pending' ? 'Oczekuje' : 
                     app.status === 'reviewed' ? 'Sprawdzone' :
                     app.status === 'accepted' ? 'Zaakceptowane' : 'Odrzucone'}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{app.message}</p>
                {app.portfolioLinks && app.portfolioLinks.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Portfolio:</p>
                    {app.portfolioLinks.map((link: string, idx: number) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#8D2D26] hover:underline block"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#8D2D26] text-white rounded-lg hover:opacity-95 transition text-sm">
                    Zarezerwuj twórcę
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">
                    Wyślij wiadomość
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

