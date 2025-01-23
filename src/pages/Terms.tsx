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
          <article className="prose max-w-none">
            <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
            <p className="text-sm text-gray-600 mb-8">Effective Date: January 23, 2025</p>

            <p className="mb-8">
              Welcome to Buggit! These Terms of Service ("Terms") govern your use of the website, applications, and services provided by Buggit ("we," "our," or "us"). By accessing or using our services, you agree to these Terms. If you do not agree, please do not use our services.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By using Buggit's services, you affirm that you are at least 18 years old or have reached the legal age of majority in your jurisdiction, and that you have the authority to agree to these Terms on behalf of yourself or any entity you represent.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Use of Services</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Account Registration</h3>
            <p className="mb-4">
              To use certain features of Buggit, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Prohibited Activities</h3>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Use Buggit for any illegal purpose.</li>
              <li>Upload viruses, malware, or other harmful software.</li>
              <li>Attempt to hack, disrupt, or reverse-engineer our services.</li>
              <li>Use Buggit in violation of any applicable laws or regulations.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Privacy</h2>
            <p className="mb-6">
              Your use of Buggit is subject to our Privacy Policy. We are committed to protecting your data in compliance with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Fees and Payments</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Pricing</h3>
            <p className="mb-4">
              Some features of Buggit are offered for free, while others may require a subscription or payment. Pricing details are available on our website.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">4.2 Refund Policy</h3>
            <p className="mb-6">
              Payments are generally non-refundable unless required by law.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Intellectual Property</h2>
            <p className="mb-6">
              Buggit and its content (excluding user-generated content) are owned by us or our licensors and are protected by copyright, trademark, and other laws. You may not use our intellectual property without our explicit permission.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. User Content</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">6.1 Ownership</h3>
            <p className="mb-4">
              You retain ownership of any content you create or upload to Buggit.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">6.2 License to Buggit</h3>
            <p className="mb-4">
              By using our services, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display your content solely to provide our services.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">6.3 Prohibited Content</h3>
            <p className="mb-6">
              You may not upload content that is illegal, harmful, or violates the rights of others.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Termination</h2>
            <p className="mb-6">
              We may suspend or terminate your access to Buggit at any time, with or without cause, including for violations of these Terms. Upon termination, your right to use the services will cease immediately.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Limitation of Liability</h2>
            <p className="mb-2">To the fullest extent permitted by law, Buggit and its affiliates are not liable for:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Indirect, incidental, or consequential damages.</li>
              <li>Loss of data, profits, or business opportunities.</li>
            </ul>
            <p className="mb-6">
              Our liability in any case will be limited to the amount you paid for our services in the 12 months preceding the incident.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">9. Indemnification</h2>
            <p className="mb-6">
              You agree to indemnify and hold Buggit harmless from any claims, damages, or expenses arising from your use of our services or violation of these Terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">10. Governing Law and Dispute Resolution</h2>
            <h3 className="text-lg font-semibold mt-4 mb-2">10.1 Governing Law</h3>
            <p className="mb-4">
              These Terms are governed by the laws of the United States and, where applicable, the laws of the European Union.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">10.2 Dispute Resolution</h3>
            <p className="mb-6">
              Any disputes will be resolved through arbitration in accordance with the rules of the American Arbitration Association. For EU residents, disputes may be referred to your local consumer protection authority.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">11. Changes to These Terms</h2>
            <p className="mb-6">
              We may update these Terms from time to time. Any changes will be effective upon posting, and your continued use of Buggit constitutes acceptance of the revised Terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">12. Contact Information</h2>
            <p className="mb-6">
              If you have questions about these Terms, please contact us at:
            </p>
            <address className="not-italic mb-8">
              Buggit<br />
              support@buggit.com<br />
              203 Qualia Dr.<br />
              Del Rio, Texas 78840
            </address>

            <p className="mt-8 mb-8">
              By using Buggit, you agree to these Terms of Service. Thank you for choosing Buggit to help manage your projects!
            </p>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
