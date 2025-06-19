import Navigation from '@/app/components/ui/navigation';
import Footer from '@/app/components/ui/footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navigation sticky={true} />
      
      <div className="max-w-xl mx-auto mt-16 px-6 pb-16">
        <h1 className="text-4xl font-serif font-bold text-red-burgundy text-center mb-8">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            At Lumo Travel Connect, we are committed to protecting your privacy and ensuring 
            transparency about how we handle your personal information. We collect only the 
            necessary user data required to provide our services, such as your Instagram public 
            profile information, and only with your explicit consent.
          </p>
          
          <p>
            When you connect your Instagram account, we access only your public profile data 
            including your username, follower count, and recent posts. This information is used 
            solely to display your creator profile and help brands discover your content.
          </p>
          
          <p>
            We do not share your personal data with third parties for marketing purposes or 
            any other unauthorized use. Your information is securely stored and used only to 
            facilitate connections between creators and brands through our platform.
          </p>
          
          <p>
            If you have any questions about our privacy practices or would like to request 
            deletion of your data, please contact us at:{' '}
            <a 
              href="mailto:contact@lumocreators.com"
              className="text-red-burgundy hover:text-red-wine font-medium transition-colors duration-200"
            >
              contact@lumocreators.com
            </a>
          </p>
          
          <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 