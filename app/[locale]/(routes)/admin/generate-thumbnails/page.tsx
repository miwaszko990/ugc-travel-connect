'use client';

import { useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { uploadPortfolioFile } from '@/app/lib/firebase/portfolio';

export default function GenerateThumbnailsAdmin() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, processed: 0, errors: 0 });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  const generateThumbnailFromVideo = async (videoUrl: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.src = videoUrl;
      
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Capture at 1 second
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.7);
      };

      video.onerror = () => {
        resolve(null);
      };
    });
  };

  const processAllVideos = async () => {
    setProcessing(true);
    setLogs([]);
    setStats({ total: 0, processed: 0, errors: 0 });

    try {
      addLog('🎬 Starting thumbnail generation process...');
      
      // Get all users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      addLog(`📊 Found ${usersSnapshot.size} users`);

      let totalVideos = 0;
      let processedVideos = 0;
      let errorCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const portfolio = userData.portfolio || [];
        
        // Find videos without thumbnails
        const videosWithoutThumbnails = portfolio.filter(
          (item: any) => item.type === 'video' && !item.thumbnailUrl
        );

        if (videosWithoutThumbnails.length === 0) continue;

        totalVideos += videosWithoutThumbnails.length;
        setStats(prev => ({ ...prev, total: totalVideos }));

        addLog(`\n👤 User: ${userData.firstName || 'Unknown'} ${userData.lastName || ''} (${userDoc.id})`);
        addLog(`   📹 Videos without thumbnails: ${videosWithoutThumbnails.length}`);

        // Process each video
        for (const video of videosWithoutThumbnails) {
          setProgress(`Processing: ${video.id}...`);
          
          try {
            addLog(`   🔄 Processing: ${video.id}`);
            
            // Generate thumbnail
            const blob = await generateThumbnailFromVideo(video.url);
            
            if (!blob) {
              addLog(`   ❌ Failed to generate thumbnail for ${video.id}`);
              errorCount++;
              continue;
            }

            // Upload thumbnail
            const thumbnailFile = new File([blob], `thumb_${video.id}.jpg`, { type: 'image/jpeg' });
            const thumbnailUrl = await uploadPortfolioFile(thumbnailFile, userDoc.id);
            
            // Update portfolio in Firestore
            const updatedPortfolio = portfolio.map((item: any) => {
              if (item.id === video.id) {
                return { ...item, thumbnailUrl };
              }
              return item;
            });

            await updateDoc(doc(db, 'users', userDoc.id), {
              portfolio: updatedPortfolio
            });

            processedVideos++;
            setStats(prev => ({ ...prev, processed: processedVideos, errors: errorCount }));
            addLog(`   ✅ Thumbnail generated and saved for ${video.id}`);
            
          } catch (error) {
            addLog(`   ❌ Error processing ${video.id}: ${error}`);
            errorCount++;
            setStats(prev => ({ ...prev, errors: errorCount }));
          }
        }
      }

      setProgress('');
      addLog(`\n🎉 Process complete!`);
      addLog(`📊 Total videos: ${totalVideos}`);
      addLog(`✅ Successfully processed: ${processedVideos}`);
      addLog(`❌ Errors: ${errorCount}`);

    } catch (error) {
      addLog(`❌ Fatal error: ${error}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎬 Video Thumbnail Generator
          </h1>
          <p className="text-gray-600 mb-6">
            This admin tool will automatically generate thumbnails for all videos in the database that don't have them.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800">Total Videos</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
              <div className="text-sm text-green-800">Processed</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
              <div className="text-sm text-red-800">Errors</div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={processAllVideos}
            disabled={processing}
            className={`w-full py-4 rounded-lg font-semibold text-white transition ${
              processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#8D2D26] hover:bg-[#7A2521]'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              '🚀 Start Thumbnail Generation'
            )}
          </button>

          {progress && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
              {progress}
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Process Logs</h2>
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`${
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('🎬') || log.includes('🎉') ? 'text-yellow-400' :
                      log.includes('👤') ? 'text-blue-400' :
                      'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

