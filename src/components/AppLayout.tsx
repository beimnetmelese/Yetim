// components/AppLayout.tsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.png";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Posts", to: "/posts", icon: FileText },
  { label: "Categories", to: "/categories", icon: FolderTree },
];

export function AppLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 md:flex">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-200/30 to-purple-200/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 right-4 z-50 md:hidden bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-200"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl shadow-indigo-500/5 transform transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="YetimTools logo"
                className="h-10 w-10 rounded-xl object-cover shadow-lg"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                YetimTools
              </h1>
            </div>
            <p className="mt-3 text-sm text-slate-500 bg-slate-100/50 rounded-lg p-2 truncate">
              {user?.email}
            </p>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <NavLink
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={20}
                        className={isActive ? "animate-pulse" : ""}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* Logout button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 transform hover:-translate-y-0.5"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-1 px-4 pt-0 pb-6 md:px-8 md:pt-0 md:pb-8"
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
