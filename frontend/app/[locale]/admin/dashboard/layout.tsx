// app/(admin)/layout.tsx  –– example
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white text-blue-900">
      <Sidebar />

      {/* main content area */}
      <main className="flex-1 overflow-y-hidden">
        {children}
      </main>
    </div>
  );
}
