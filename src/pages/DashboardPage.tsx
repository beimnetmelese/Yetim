// pages/DashboardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  FileText,
  FolderTree,
  Eye,
  TrendingUp,
  Activity,
  Award,
} from "lucide-react";

interface DashboardStats {
  dau: number;
  wau: number;
  mau: number;
  yau: number;
  totalPosts: number;
  totalCategories: number;
  totalVisits: number;
}

const initialStats: DashboardStats = {
  dau: 0,
  wau: 0,
  mau: 0,
  yau: 0,
  totalPosts: 0,
  totalCategories: 0,
  totalVisits: 0,
};

function timeThreshold(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function getSparklineHeights(cardIndex: number) {
  const base = [18, 26, 14, 30, 22, 34, 20, 28];
  return base.map((value, index) => value + ((cardIndex + index) % 4) * 3);
}

const statCards = [
  {
    label: "Daily Active",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
    suffix: "users",
  },
  {
    label: "Weekly Active",
    icon: Calendar,
    gradient: "from-indigo-500 to-purple-500",
    suffix: "users",
  },
  {
    label: "Monthly Active",
    icon: Activity,
    gradient: "from-purple-500 to-pink-500",
    suffix: "users",
  },
  {
    label: "Yearly Active",
    icon: Award,
    gradient: "from-pink-500 to-rose-500",
    suffix: "users",
  },
  {
    label: "Total Posts",
    icon: FileText,
    gradient: "from-green-500 to-emerald-500",
    suffix: "posts",
  },
  {
    label: "Categories",
    icon: FolderTree,
    gradient: "from-orange-500 to-amber-500",
    suffix: "categories",
  },
  {
    label: "Site Visits",
    icon: Eye,
    gradient: "from-red-500 to-rose-500",
    suffix: "visits",
  },
];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);

      const visitKey = "visit-counted";
      if (!sessionStorage.getItem(visitKey)) {
        await supabase.rpc("increment_site_visits").then(() => {
          sessionStorage.setItem(visitKey, "1");
        });
      }

      const [
        dauRes,
        wauRes,
        mauRes,
        yauRes,
        postsRes,
        categoriesRes,
        visitsRes,
      ] = await Promise.all([
        supabase
          .from("user_activity")
          .select("*", { count: "exact", head: true })
          .gte("last_seen_at", timeThreshold(1)),
        supabase
          .from("user_activity")
          .select("*", { count: "exact", head: true })
          .gte("last_seen_at", timeThreshold(7)),
        supabase
          .from("user_activity")
          .select("*", { count: "exact", head: true })
          .gte("last_seen_at", timeThreshold(30)),
        supabase
          .from("user_activity")
          .select("*", { count: "exact", head: true })
          .gte("last_seen_at", timeThreshold(365)),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("site_stats").select("total_visits").eq("id", 1).single(),
      ]);

      const firstError = [
        dauRes.error,
        wauRes.error,
        mauRes.error,
        yauRes.error,
        postsRes.error,
        categoriesRes.error,
        visitsRes.error,
      ].find(Boolean);

      if (firstError) {
        setError(firstError.message);
      } else {
        setStats({
          dau: dauRes.count ?? 0,
          wau: wauRes.count ?? 0,
          mau: mauRes.count ?? 0,
          yau: yauRes.count ?? 0,
          totalPosts: postsRes.count ?? 0,
          totalCategories: categoriesRes.count ?? 0,
          totalVisits: visitsRes.data?.total_visits ?? 0,
        });
      }

      setLoading(false);
    };

    loadStats().catch((err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard stats.";
      setError(message);
      setLoading(false);
    });
  }, []);

  const statsArray = useMemo(
    () => [
      stats.dau,
      stats.wau,
      stats.mau,
      stats.yau,
      stats.totalPosts,
      stats.totalCategories,
      stats.totalVisits,
    ],
    [stats],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-500 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-500" />
          Real-time analytics from your application
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-50/80 backdrop-blur-sm border border-rose-200 rounded-2xl p-4"
        >
          <p className="text-rose-600 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6, scale: 1.015 }}
            className="group relative"
          >
            <div
              className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-30`}
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-transparent pointer-events-none" />

              <div className="flex items-start justify-between">
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500/90">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? (
                      <span className="inline-block h-8 w-20 animate-pulse rounded-lg bg-slate-200/80" />
                    ) : (
                      statsArray[index].toLocaleString()
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{card.suffix}</p>
                </div>

                <div className="relative z-10 flex flex-col items-end gap-2">
                  <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    Live
                  </span>
                  <div
                    className={`rounded-xl bg-gradient-to-br ${card.gradient} p-3 shadow-lg shadow-slate-300/50`}
                  >
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex gap-1.5">
                {getSparklineHeights(index).map((height, sparkIndex) => (
                  <motion.div
                    key={sparkIndex}
                    initial={{ height: 0, opacity: 0.3 }}
                    animate={{ height, opacity: 0.8 }}
                    transition={{ delay: index * 0.08 + sparkIndex * 0.04 }}
                    className={`w-2 rounded-full bg-gradient-to-t ${card.gradient} group-hover:opacity-100`}
                  />
                ))}
              </div>

              <div className="relative z-10 mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <div className="relative z-10 mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Updated now</span>
                <span className="font-medium text-emerald-600">● Active</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
