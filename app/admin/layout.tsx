import { Sidebar } from "@/components/admin/sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // We can't easily get the pathname here in a Server Component without 
  // custom headers from middleware. But we can check if there's a session.
  // The middleware handles the actual protection/redirects.
  
  const showSidebar = !!session;

  return (
    <div className="h-full relative">
      {showSidebar && (
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
          <Sidebar />
        </div>
      )}
      <main className={showSidebar ? "md:pl-72 h-full" : "h-full"}>
        {children}
      </main>
    </div>
  );
}

