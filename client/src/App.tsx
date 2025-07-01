import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorBoundaryEnhanced from "@/components/error-boundary-enhanced";

// Critical public pages (loaded immediately)
import Home from "@/pages/home-clickmax";
import Login from "@/pages/auth/login";

// Lazy loaded public pages
const RegisterStep1 = lazy(() => import("@/pages/auth/register-step1"));
const RegisterStep2 = lazy(() => import("@/pages/auth/register-step2"));
const RegisterStep3 = lazy(() => import("@/pages/auth/register-step3"));
const EmailSent = lazy(() => import("@/pages/auth/email-sent"));
const VerifyEmail = lazy(() => import("@/pages/auth/verify-email"));
const EmailNotVerified = lazy(() => import("@/pages/auth/email-not-verified"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/auth/reset-password"));
const SelectUserType = lazy(() => import("@/pages/auth/select-user-type"));
const Pricing = lazy(() => import("@/pages/pricing"));
const ComoFunciona = lazy(() => import("@/pages/como-funciona"));
const QuemSomos = lazy(() => import("@/pages/quem-somos"));
const Contato = lazy(() => import("@/pages/contato"));
const EmailDemo = lazy(() => import("@/pages/test/email-demo"));

// Lazy loaded protected pages (grouped by feature)
const Dashboard = lazy(() => import("@/pages/dashboard/dashboard-clean"));

// Events module
const Events = lazy(() => import("@/pages/events/events"));
const CreateEvent = lazy(() => import("@/pages/events/create-event"));
const EventDetail = lazy(() => import("@/pages/events/event-detail"));
const EventDetails = lazy(() => import("@/pages/events/event-details"));

// Services module
const ManageServices = lazy(() => import("@/pages/services/manage-services"));
const Services = lazy(() => import("@/pages/services/index"));

// Venues module
const ManageVenues = lazy(() => import("@/pages/venues/manage-venues"));
const CreateVenue = lazy(() => import("@/pages/venues/create-venue"));
const Venues = lazy(() => import("@/pages/venues/index"));

// Chat and Communication
const Chat = lazy(() => import("@/pages/chat"));

// Analytics and Business Intelligence
const Analytics = lazy(() => import("@/pages/analytics"));

// Subscription and Payments
const ManageSubscription = lazy(() => import("@/pages/subscription/manage-subscription"));
const Subscribe = lazy(() => import("@/pages/subscribe"));
const SubscriptionManagement = lazy(() => import("@/pages/subscription-management-simple"));

// User Management
const Profile = lazy(() => import("@/pages/profile"));
const Settings = lazy(() => import("@/pages/settings"));
const TwoFactor = lazy(() => import("@/pages/two-factor"));

// Additional Features
const SearchPage = lazy(() => import("@/pages/search"));
const Cart = lazy(() => import("@/pages/cart"));
const Contracts = lazy(() => import("@/pages/contracts"));
const APIDocs = lazy(() => import("@/pages/api-docs"));
const Agenda = lazy(() => import("@/pages/agenda"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const Support = lazy(() => import("@/pages/support"));
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