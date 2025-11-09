import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import HomePage from '../pages/Home/HomePage';
import AboutPage from '../pages/About/AboutPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicy/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/TermsOfService/TermsOfServicePage';
import SubscriptionTermsPage from '../pages/SubscriptionTerms/SubscriptionTermsPage';
import LegalPage from '../pages/Legal/LegalPage';
import SupportPage from '../pages/Support/SupportPage';
import FAQPage from '../pages/FAQ/FAQPage';
import ContactPage from '../pages/Contact/ContactPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'terms-of-service', element: <TermsOfServicePage /> },
      { path: 'subscription-terms', element: <SubscriptionTermsPage /> },
      { path: 'legal', element: <LegalPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'faq', element: <FAQPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

