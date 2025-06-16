import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";

// Public Pages
import Home from "@/pages/home-clean";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import SelectUserType from "@/pages/auth/select-user-type";
import Pricing from "@/pages/pricing";

// Protected Pages
import Dashboard from "@/pages/dashboard/dashboard";
import Events from "@/pages/events/events";
import CreateEvent from "@/pages/events/create-event";
import EventDetail from "@/pages/events/event-detail";
import Services from "@/pages/services";
import Venues from "@/pages/venues";
import Analytics from "@/pages/analytics";
import Chat from "@/pages/chat";
import Subscribe from "@/pages/subscribe";
import SubscriptionManagement from "@/pages/subscription-management-simple";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import SearchPage from "@/pages/search";
import Cart from "@/pages/cart";
import Contracts from "@/pages/contracts";
import APIDocs from "@/pages/api-docs";
import TwoFactor from "@/pages/two-factor";
import AuthGuard from "@/components/auth/auth-guard";
import NotFound from "@/pages/not-found";

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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/select-user-type" component={SelectUserType} />
      <Route path="/pricing" component={Pricing} />
      
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
      
      <Route path="/services">
        <Layout>
          <AuthGuard>
            <Services />
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
            <Analytics />
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
      
      <Route path="/two-factor">
        <Layout>
          <AuthGuard>
            <TwoFactor />
          </AuthGuard>
        </Layout>
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