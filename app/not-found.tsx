export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2">
          The page you're looking for doesn't exist.
        </p>
        <a 
          href="/lumo" 
          className="mt-6 inline-block px-6 py-3 bg-red-burgundy text-white rounded-lg hover:bg-red-burgundy/90 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
} 