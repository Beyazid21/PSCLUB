import { Sidebar } from "@/components/admin/sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { OrderNotification } from "@/components/admin/order-notification"; // Yeni əlavə

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const showSidebar = !!session;

  return (
    <div className="h-full relative">
      {/* Səsli bildiriş və Pusher dinləyicisi burada aktivləşir */}
      {showSidebar && <OrderNotification />} 

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