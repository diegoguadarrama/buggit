import { Helmet } from 'react-helmet';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Buggit</title>
        <meta name="description" content="Terms of Service for Buggit - Project Management Tool" />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Buggit ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Description of Service</h2>
            <p>Buggit is a project management tool that provides task management, collaboration features, and project organization capabilities.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. User Accounts</h2>
            <p>You must create an account to use Buggit. You are responsible for maintaining the security of your account and for all activities that occur under your account.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. User Content</h2>
            <p>You retain all rights to any content you submit, post or display on or through the Service. By submitting content, you grant Buggit a worldwide, non-exclusive license to use, copy, modify, and distribute your content.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Prohibited Uses</h2>
            <p>You agree not to misuse the Service or help anyone else do so. You must not use the Service for any illegal or unauthorized purpose.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the Service, us, or third parties, or for any other reason.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify users of any material changes to these terms.</p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}