import React from 'react';

interface InstagramFeedProps {
  instagramHandle: string;
}

const InstagramFeed: React.FC<InstagramFeedProps> = ({ instagramHandle }) => {
  if (!instagramHandle) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Latest from Instagram</h2>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <div className="aspect-[3/1] w-full rounded-2xl overflow-hidden shadow-lg bg-white p-4">
            <iframe
              src={`https://lightwidget.com/widgets/${instagramHandle}.html`}
              title="Instagram Feed"
              className="w-full h-[400px] min-h-[300px] max-h-[600px] border-0"
              allowTransparency
              style={{ border: 'none', width: '100%', height: '100%' }}
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed; 