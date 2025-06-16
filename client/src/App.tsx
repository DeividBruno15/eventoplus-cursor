import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import SelectUserType from "@/pages/auth/select-user-type";
import Dashboard from "@/pages/dashboard/dashboard";
import Events from "@/pages/events/events";
import CreateEvent from "@/pages/events/create-event";
import EventDetail from "@/pages/events/event-detail";
import Services from "@/pages/services";
import Venues from "@/pages/venues";
import Analytics from "@/pages/analytics";
import Chat from "@/pages/chat";
import Pricing from "@/pages/pricing";
import Subscribe from "@/pages/subscribe";
import SubscriptionManagement from "@/pages/subscription-management";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import AuthGuard from "@/components/auth/auth-guard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/select-user-type" component={SelectUserType} />
        <Route path="/pricing" component={Pricing} />
        
        {/* Protected Routes */}
        <Route path="/dashboard">
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/events">
          <AuthGuard>
            <Events />
          </AuthGuard>
        </Route>
        <Route path="/events/create">
          <AuthGuard>
            <CreateEvent />
          </AuthGuard>
        </Route>
        <Route path="/events/:id">
          <AuthGuard>
            <EventDetail />
          </AuthGuard>
        </Route>
        <Route path="/services">
          <AuthGuard>
            <Services />
          </AuthGuard>
        </Route>
        <Route path="/venues">
          <AuthGuard>
            <Venues />
          </AuthGuard>
        </Route>
        <Route path="/analytics">
          <AuthGuard>
            <Analytics />
          </AuthGuard>
        </Route>
        <Route path="/chat">
          <AuthGuard>
            <Chat />
          </AuthGuard>
        </Route>
        <Route path="/subscribe">
          <AuthGuard>
            <Subscribe />
          </AuthGuard>
        </Route>
        <Route path="/subscription">
          <AuthGuard>
            <SubscriptionManagement />
          </AuthGuard>
        </Route>
        <Route path="/profile">
          <AuthGuard>
            <Profile />
          </AuthGuard>
        </Route>
        <Route path="/settings">
          <AuthGuard>
            <Settings />
          </AuthGuard>
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
