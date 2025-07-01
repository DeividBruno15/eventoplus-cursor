import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";

// Public Pages
import Home from "@/pages/home-clickmax";
import Login from "@/pages/auth/login";
import RegisterStep1 from "@/pages/auth/register-step1";
import RegisterStep2 from "@/pages/auth/register-step2";
import RegisterStep3 from "@/pages/auth/register-step3";
import EmailSent from "@/pages/auth/email-sent";
import VerifyEmail from "@/pages/auth/verify-email";
import EmailNotVerified from "@/pages/auth/email-not-verified";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import SelectUserType from "@/pages/auth/select-user-type";
import Pricing from "@/pages/pricing";
import ComoFunciona from "@/pages/como-funciona";
import QuemSomos from "@/pages/quem-somos";
import Contato from "@/pages/contato";
import EmailDemo from "@/pages/test/email-demo";

// Protected Pages
import Dashboard from "@/pages/dashboard/dashboard-professional";
import Events from "@/pages/events/events";
import CreateEvent from "@/pages/events/create-event";
import EventDetail from "@/pages/events/event-detail";
import EventDetails from "@/pages/events/event-details";
import ManageServices from "@/pages/services/manage-services";
import ManageVenues from "@/pages/venues/manage-venues";
import CreateVenue from "@/pages/venues/create-venue";
import ManageSubscription from "@/pages/subscription/manage-subscription";
import Chat from "@/pages/chat";
import Services from "@/pages/services/index";
import Venues from "@/pages/venues/index";
import Analytics from "@/pages/analytics";
import Subscribe from "@/pages/subscribe";
import SubscriptionManagement from "@/pages/subscription-management-simple";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import SearchPage from "@/pages/search";
import Cart from "@/pages/cart";
import Contracts from "@/pages/contracts";
import APIDocs from "@/pages/api-docs";
import TwoFactor from "@/pages/two-factor";
import Agenda from "@/pages/agenda";
import HelpCenter from "@/pages/help-center";
import Support from "@/pages/support";
import NotificationsPage from "@/pages/notifications";
import AdvertiserAnalytics from "@/pages/analytics-advertiser";
import AuthGuard from "@/components/auth/auth-guard";
import NotFound from "@/pages/not-found";
import Providers from "@/pages/providers";
import Bookings from "@/pages/bookings";
import PixPayment from "@/pages/pix-payment";
import OfflinePage from "@/pages/offline";
import Reviews from "@/pages/reviews-simple";
import Backup from "@/pages/backup";
import AnalyticsAdvanced from "@/pages/analytics-advanced";
import SplitPayments from "@/pages/split-payments";
import PublicApi from "@/pages/public-api";
import VariableCommissions from "@/pages/variable-commissions";
import BIDashboard from "@/pages/bi-dashboard";
import AIRecommendations from "@/pages/ai-recommendations";
import { useAuth } from "@/hooks/use-auth";

// Analytics Wrapper Component
function AnalyticsWrapper() {
  const { user } = useAuth();
  
  if (user?.userType === 'anunciante') {
    return <AdvertiserAnalytics />;
  }
  
  return <Analytics />;
}

// Services Wrapper Component
function ServicesWrapper() {
  const { user } = useAuth();
  
  if (user?.userType === 'prestador') {
    return <ManageServices />;
  }
  
  return <Services />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes - No Layout */}
      <Route path="/" component={Home} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={RegisterStep1} />

      <Route path="/auth/register-step1" component={RegisterStep1} />
      <Route path="/auth/register-step2" component={RegisterStep2} />
      <Route path="/auth/register-step3" component={RegisterStep3} />
      <Route path="/auth/email-sent" component={EmailSent} />
      <Route path="/auth/verify-email" component={VerifyEmail} />
      <Route path="/auth/email-not-verified" component={EmailNotVerified} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      <Route path="/select-user-type" component={SelectUserType} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/como-funciona" component={ComoFunciona} />
      <Route path="/quem-somos" component={QuemSomos} />
      <Route path="/contato" component={Contato} />
      <Route path="/test/email-demo" component={EmailDemo} />
      
      {/* Protected Routes - With Layout */}
      <Route path="/dashboard">
        <Layout>
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/search">
        <Layout>
          <AuthGuard>
            <SearchPage />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/cart">
        <Layout>
          <AuthGuard>
            <Cart />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/contracts">
        <Layout>
          <AuthGuard>
            <Contracts />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/api-docs">
        <Layout>
          <AuthGuard>
            <APIDocs />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/events">
        <Layout>
          <AuthGuard>
            <Events />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/events/create">
        <Layout>
          <AuthGuard>
            <CreateEvent />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/events/:id">
        <Layout>
          <AuthGuard>
            <EventDetail />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/services/manage">
        <Layout>
          <AuthGuard>
            <ManageServices />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/services/create">
        <Layout>
          <AuthGuard>
            <ManageServices />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/venues/manage">
        <Layout>
          <AuthGuard>
            <ManageVenues />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/venues/create">
        <Layout>
          <AuthGuard>
            <CreateVenue />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/subscription/manage">
        <Layout>
          <AuthGuard>
            <ManageSubscription />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/notifications">
        <Layout>
          <AuthGuard>
            <NotificationsPage />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/services">
        <Layout>
          <AuthGuard>
            <ServicesWrapper />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/venues">
        <Layout>
          <AuthGuard>
            <Venues />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/analytics">
        <Layout>
          <AuthGuard>
            <AnalyticsWrapper />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/chat">
        <Layout>
          <AuthGuard>
            <Chat />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/subscribe">
        <Layout>
          <AuthGuard>
            <Subscribe />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/pix-payment">
        <Layout>
          <AuthGuard>
            <PixPayment />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/subscription">
        <Layout>
          <AuthGuard>
            <SubscriptionManagement />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/profile">
        <Layout>
          <AuthGuard>
            <Profile />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/settings">
        <Layout>
          <AuthGuard>
            <Settings />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/reviews">
        <Layout>
          <AuthGuard>
            <Reviews />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/backup">
        <Layout>
          <AuthGuard>
            <Backup />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/analytics-advanced">
        <Layout>
          <AuthGuard>
            <AnalyticsAdvanced />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/split-payments">
        <Layout>
          <AuthGuard>
            <SplitPayments />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/public-api">
        <Layout>
          <AuthGuard>
            <PublicApi />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/variable-commissions">
        <Layout>
          <AuthGuard>
            <VariableCommissions />
          </AuthGuard>
        </Layout>
      </Route>

      <Route path="/bi-dashboard">
        <Layout>
          <AuthGuard>
            <BIDashboard />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/ai-recommendations">
        <Layout>
          <AuthGuard>
            <AIRecommendations />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/two-factor">
        <Layout>
          <AuthGuard>
            <TwoFactor />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/agenda">
        <Layout>
          <AuthGuard>
            <Agenda />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/help-center">
        <Layout>
          <AuthGuard>
            <HelpCenter />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/support">
        <Layout>
          <AuthGuard>
            <Support />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/providers">
        <Layout>
          <AuthGuard>
            <Providers />
          </AuthGuard>
        </Layout>
      </Route>
      
      <Route path="/bookings">
        <Layout>
          <AuthGuard>
            <Bookings />
          </AuthGuard>
        </Layout>
      </Route>
      
      {/* PWA Offline page */}
      <Route path="/offline">
        <OfflinePage />
      </Route>
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;