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
          <article className="prose max-w-none">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-sm text-gray-600 mb-8">Effective Date: January 23, 2025</p>

            <p className="mb-8">
              At Buggit, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information, in compliance with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">1.1 Information You Provide</h3>
            <p className="mb-2">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Information:</strong> Your name, email address, and password when you create an account.</li>
              <li><strong>Content:</strong> Any data you upload, input, or create using our services, such as project details or notes.</li>
              <li><strong>Payment Information:</strong> If you make a purchase, we collect payment details (processed securely by third-party payment providers).</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">1.2 Information Collected Automatically</h3>
            <p className="mb-2">We collect certain information automatically when you use our services, such as:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Usage Data:</strong> IP address, browser type, operating system, and interactions with our platform.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies to enhance your experience and analyze site usage.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">1.3 Third-Party Data</h3>
            <p className="mb-6">
              We may receive information from third-party sources, such as authentication providers like Google if you log in using third-party credentials.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Provide, maintain, and improve our services.</li>
              <li>Personalize your experience on our platform.</li>
              <li>Communicate with you about updates, promotions, or issues related to your account.</li>
              <li>Comply with legal obligations.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Legal Bases for Processing (GDPR)</h2>
            <p className="mb-2">Under GDPR, we rely on the following legal bases for processing your personal data:</p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Consent:</strong> When you provide explicit consent for specific activities, such as receiving marketing emails.</li>
              <li><strong>Contract:</strong> To fulfill our obligations under a service agreement.</li>
              <li><strong>Legal Obligation:</strong> When required to comply with applicable laws.</li>
              <li><strong>Legitimate Interests:</strong> For activities such as improving our services and preventing fraud.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Your Rights</h2>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">4.1 GDPR Rights</h3>
            <p className="mb-2">If you are located in the European Economic Area (EEA), you have the following rights:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Access: Request a copy of your personal data.</li>
              <li>Correction: Request corrections to inaccurate or incomplete data.</li>
              <li>Deletion: Request the deletion of your personal data ("right to be forgotten").</li>
              <li>Objection: Object to the processing of your data for specific purposes.</li>
              <li>Portability: Request your data in a structured, machine-readable format.</li>
              <li>Complaint: File a complaint with your local data protection authority.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">4.2 CCPA Rights</h3>
            <p className="mb-2">If you are a California resident, you have the following rights:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Access: Request details about the personal information we collect, use, and disclose.</li>
              <li>Deletion: Request that we delete your personal information, subject to certain exceptions.</li>
              <li>Opt-Out: Opt-out of the sale of your personal information (note: we do not sell your data).</li>
              <li>Non-Discrimination: You have the right not to be discriminated against for exercising your CCPA rights.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Sharing Your Information</h2>
            <p className="mb-2">We do not sell your personal data. We may share your information with:</p>
            <ul className="list-disc pl-6 mb-6">
              <li>Service Providers: Third-party vendors who help us provide and maintain our services.</li>
              <li>Legal Authorities: When required by law or to protect our legal rights.</li>
              <li>Business Transfers: In the event of a merger, acquisition, or sale of our business.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Data Retention</h2>
            <p className="mb-6">
              We retain your personal data only as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When no longer needed, we securely delete or anonymize your data.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Data Security</h2>
            <p className="mb-6">
              We implement technical and organizational measures to protect your data against unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. International Data Transfers</h2>
            <p className="mb-6">
              If you are located outside of the United States, your data may be transferred to and processed in the United States or other countries. We ensure that such transfers comply with applicable data protection laws.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">9. Children's Privacy</h2>
            <p className="mb-6">
              Buggit is not intended for children under the age of 13, and we do not knowingly collect personal data from children. If we become aware of such data, we will delete it promptly.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">10. Changes to This Policy</h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Effective Date." Continued use of our services after changes constitutes acceptance of the revised policy.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have any questions or concerns about this Privacy Policy or your data, please contact us at:
            </p>
            <address className="not-italic mb-8">
              Buggit<br />
              support@buggit.com<br />
              203 Qualia Dr.<br />
              Del Rio, Texas 78840
            </address>

            <p className="mt-8 mb-8">
              By using Buggit, you agree to this Privacy Policy. Thank you for trusting us with your information!
            </p>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
