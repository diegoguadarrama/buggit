import { Helmet } from 'react-helmet';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Buggit</title>
        <meta name="description" content="Privacy Policy for Buggit - Project Management Tool" />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, use our service, or communicate with us. This may include your name, email address, and any other information you choose to provide.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and protect our services and users.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Information Sharing</h2>
            <p>We do not share your personal information with third parties except as described in this policy. We may share your information with service providers who assist us in providing our services.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Security</h2>
            <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You can also object to or restrict certain processing of your information.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Changes to Privacy Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Contact Us</h2>
            <p>If you have any questions about this privacy policy, please contact us.</p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}