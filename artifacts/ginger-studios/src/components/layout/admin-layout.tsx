import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useAdminLogout } from "@workspace/api-client-react";
import { LayoutDashboard, Images, PlusCircle, LogOut, LayoutTemplate } from "lucide-react";
import { img } from "@/lib/assets";
const logoIcon = img("images/logo-icon.png");

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user, isLoading } = useGetMe({ query: { retry: false } as any });
  
  const logout = useAdminLogout();

  // Must be in useEffect — calling setLocation during render causes an infinite crash loop
  useEffect(() => {
    if (!isLoading && !user && location.startsWith("/admin") && location !== "/admin") {
      setLocation("/admin");
    }
  }, [isLoading, user, location, setLocation]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/admin");
      }
    });
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Galleries", href: "/admin/galleries", icon: Images },
    { label: "New Gallery", href: "/admin/galleries/new", icon: PlusCircle },
    { label: "Site Images", href: "/admin/site-images", icon: LayoutTemplate },
  ];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }

  // Return null while the redirect useEffect is pending — prevents children from crashing
  if (!user) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <img src={logoIcon} alt="Ginger Studios" className="w-8 h-8 object-contain" />
          <span className="font-serif font-semibold text-lg text-foreground">Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:bg-muted hover:text-foreground'}`}>
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-4 px-4 text-sm text-muted-foreground break-all">
            {user?.email}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-muted/20">
        <div className="p-6 md:p-10 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
