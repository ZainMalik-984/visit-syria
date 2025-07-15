"use client";
import { useState, Fragment } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LayoutDashboard, Users, ShoppingBag, Settings, Layers  } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

export default function Sidebar() {
  // Mobile starts closed, desktop starts open
  const [open, setOpen] = useState<boolean>(typeof window !== "undefined" && window.innerWidth >= 640);
  const toggle = () => setOpen((prev) => !prev);

  // Close sidebar when clicking a link on mobile
  const closeSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* ─────────── Floating Toggle Button ─────────── */}
      <button
        onClick={toggle}
        className="z-40 h-12 w-12 absolute right-0 mt-2 mr-2 inline-flex items-center justify-center p-2 text-indigo-600 bg-white rounded-full shadow-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-transform duration-200 active:scale-95"
      >
        {open ? <X className="w-6 h-6 " /> : <Menu className="w-6 h-6" />}
        <span className="sr-only">Toggle sidebar</span>
      </button>

      {/* ─────────── Mobile Sidebar with Dialog overlay ─────────── */}
      <Transition show={open && typeof window !== "undefined" && window.innerWidth < 640} as={Fragment}>
        <Dialog as="div" className="relative z-40 sm:hidden" onClose={toggle}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 left-0 flex w-64 max-w-full bg-gradient-to-b from-white to-indigo-50 text-indigo-900 border-r border-indigo-200 shadow-lg">
              <SidebarContent onClose={toggle} onLinkClick={closeSidebar} />
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      {/* ─────────── Desktop Sidebar ─────────── */}
      <aside
        className={`${open ? "sm:flex" : "hidden"} sm:flex-col z-30 w-64 lg:w-72 bg-gradient-to-b from-white to-indigo-50 text-indigo-900 border-r border-indigo-200 transform transition-transform duration-300`}
      >
        <SidebarContent onLinkClick={closeSidebar} />
      </aside>
    </>
  );
}

/* ------------------- Sidebar Inner Layout ------------------- */
function SidebarContent({ onClose, onLinkClick }: { onClose?: () => void; onLinkClick?: () => void }) {
  const pathname = usePathname();

  // Navigation items with their routes
  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "User & supplier",
      href: "/userPenal",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Product Management",
      href: "/inbox",
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: "3",
    },
    {
      label: "Category Management",
      href: "/users",
      icon: <Layers  className="w-5 h-5" />,
    },
    {
      label: "general Settings",
      href: "/products",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex flex-col h-full px-4 py-6 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" onClick={onLinkClick}>
          <h2 className="text-2xl font-bold text-indigo-900 cursor-pointer hover:text-indigo-700 transition-colors">
            Admin Dashboard
          </h2>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="text-indigo-900 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 font-medium">
        {navigationItems.map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            badge={item.badge}
            isActive={pathname === item.href}
            onLinkClick={onLinkClick}
          />
        ))}
      </nav>
    </div>
  );
}

/* ---------------------- Nav Item with Link ---------------------- */
function NavItem({ 
  label, 
  href, 
  icon, 
  badge, 
  isActive, 
  onLinkClick 
}: { 
  label: string; 
  href: string; 
  icon?: React.ReactNode; 
  badge?: string; 
  isActive?: boolean;
  onLinkClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onLinkClick}>
      <div
        className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 cursor-pointer ${
          isActive
            ? "bg-indigo-100 text-indigo-700 shadow-sm"
            : "text-indigo-900 hover:bg-indigo-100 hover:text-indigo-700"
        }`}
      >
        {icon ? icon : <span className="h-2 w-2 rounded-full bg-indigo-300 group-hover:bg-indigo-600" />}
        <span className="flex-1 whitespace-nowrap ml-2">{label}</span>
        {badge && (
          <span className="ml-auto inline-flex items-center justify-center px-2 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
