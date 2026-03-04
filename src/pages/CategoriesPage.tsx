// pages/CategoriesPage.tsx
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Hash,
  Calendar,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCategories(data ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setShowForm(false);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    if (editingId) {
      const { error: updateError } = await supabase
        .from("categories")
        .update({ name: name.trim() })
        .eq("id", editingId);
      if (updateError) setError(updateError.message);
    } else {
      const { error: createError } = await supabase
        .from("categories")
        .insert({ name: name.trim() });
      if (createError) setError(createError.message);
    }

    setSaving(false);
    resetForm();
    await loadCategories();
  };

  const onEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setShowForm(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (!deleteError) await loadCategories();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-slate-500 mt-1">
            Organize your content with categories
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showForm ? "Close" : "New Category"}</span>
        </motion.button>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={onSubmit}
            className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-xl"
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                <Hash size={16} className="text-indigo-500" />
                Category Name
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Enter category name"
              />
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-xl"
              >
                {error}
              </motion.p>
            )}

            <div className="mt-6 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Create Category"}
              </motion.button>
              {editingId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 rounded-2xl p-6 h-24 animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FolderTree className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            No categories yet. Create your first category!
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <FolderTree className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(category)}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Edit2 size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(category.id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {category.name}
                </h3>

                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar size={12} />
                  <span>
                    {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
