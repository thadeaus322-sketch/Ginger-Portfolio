import { Link } from "wouter";
import { useGetGalleryStats, useListGalleries } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Images, AlertCircle, CheckCircle, Clock, Link as LinkIcon, Eye, Edit, MoreVertical } from "lucide-react";
import { getGalleryUrl } from "@/lib/galleryLinks";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetGalleryStats();
  const { data: galleries, isLoading: galleriesLoading } = useListGalleries();

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-card border border-border p-6 rounded-sm shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-full ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <h3 className="font-serif text-3xl text-foreground mt-1">{statsLoading ? "-" : value}</h3>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20"><CheckCircle size={12}/> Active</span>;
      case 'expiring_soon':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20"><Clock size={12}/> Expiring Soon</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"><AlertCircle size={12}/> Expired</span>;
      case 'revoked':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20"><AlertCircle size={12}/> Revoked</span>;
      default:
        return null;
    }
  };

  const copyLink = (token: string) => {
     const gallery = galleries?.find((item) => item.accessToken === token);
     const url = gallery
       ? getGalleryUrl(window.location.origin, gallery.shootTitle, token)
       : `${window.location.origin}/gallery/${token}`;
    navigator.clipboard.writeText(url);
    // would be nice to have toast here but imported useToast above or just rely on simple feedback
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Overview of all client deliveries</p>
        </div>
        <Link href="/admin/galleries/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-sm font-medium hover:bg-primary/90 transition-colors">
          <Images size={18} /> New Gallery
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Galleries" value={stats?.totalGalleries} icon={Images} colorClass="bg-primary/10 text-primary" />
        <StatCard title="Active" value={stats?.activeGalleries} icon={CheckCircle} colorClass="bg-green-500/10 text-green-600" />
        <StatCard title="Expiring Soon" value={stats?.expiringSoon} icon={Clock} colorClass="bg-amber-500/10 text-amber-600" />
        <StatCard title="Expired" value={stats?.expiredGalleries} icon={AlertCircle} colorClass="bg-muted text-muted-foreground" />
      </div>

      {/* Galleries Table */}
      <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="font-serif text-xl text-foreground">Recent Galleries</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Client / Shoot</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Expires</th>
                <th className="px-6 py-4 font-medium text-center">Images</th>
                <th className="px-6 py-4 font-medium text-center">Views</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleriesLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading galleries...</td></tr>
              ) : galleries?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No galleries found. Create one to get started.</td></tr>
              ) : (
                galleries?.map((gallery) => (
                  <tr key={gallery.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{gallery.clientName}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{gallery.shootTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(gallery.status)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(gallery.expiresAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-foreground">
                      {gallery.imageCount}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground flex items-center justify-center gap-1.5">
                      <Eye size={14} /> {gallery.viewCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => copyLink(gallery.accessToken)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-border rounded bg-background"
                          title="Copy Link"
                        >
                          <LinkIcon size={16} />
                        </button>
                        <Link 
                          href={`/admin/galleries/${gallery.id}`}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-border rounded bg-background"
                          title="Edit Gallery"
                        >
                          <Edit size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
