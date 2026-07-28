import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { PublicLayout } from "./components/layout/public-layout";
import { AdminLayout } from "./components/layout/admin-layout";
import Home from "./pages/home";
import NotFound from "./pages/not-found";
import Photography from "./pages/photography";
import Videography from "./pages/videography";
import ClientGallery from "./pages/client-gallery";
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import NewGallery from "./pages/admin/new-gallery";
import GalleryDetail from "./pages/admin/gallery-detail";
import SiteImages from "./pages/admin/site-images";
import { useGetMe } from "@workspace/api-client-react";

// Admin Protected Route Wrapper — never call setLocation/Redirect during render
function ProtectedAdminRoute({ component: Component }: { component: any }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user, isLoading } = useGetMe({ query: { retry: false } as any });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }

  // Render nothing while the useEffect redirect is pending
  if (!user) return null;

  return <Component />;
}

function PublicRoutes() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/photography" component={Photography} />
        <Route path="/videography" component={Videography} />
        <Route path="/gallery" component={ClientGallery} />
        <Route path="/gallery/:token" component={ClientGallery} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/*">
        <AdminLayout>
          <Switch>
            <Route path="/admin/dashboard" component={() => <ProtectedAdminRoute component={AdminDashboard} />} />
            <Route path="/admin/galleries/new" component={() => <ProtectedAdminRoute component={NewGallery} />} />
            <Route path="/admin/galleries/:id" component={() => <ProtectedAdminRoute component={GalleryDetail} />} />
            <Route path="/admin/galleries" component={() => <ProtectedAdminRoute component={AdminDashboard} />} />
            <Route path="/admin/site-images" component={() => <ProtectedAdminRoute component={SiteImages} />} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      {/* Route matching priority: /admin matches first */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/*" component={AdminRoutes} />
      {/* Everything else falls back to PublicRoutes */}
      <Route path="/*" component={PublicRoutes} />
    </Switch>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
