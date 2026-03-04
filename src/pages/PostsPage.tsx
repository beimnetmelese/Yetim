// pages/PostsPage.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Package,
  DollarSign,
  Tag,
  FileText,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Post {
  id: string;
  category_id: string | null;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  created_at: string;
}

interface PostFormState {
  name: string;
  price: string;
  description: string;
  category_id: string;
  imageFile: File | null;
}

const initialForm: PostFormState = {
  name: "",
  price: "",
  description: "",
  category_id: "",
  imageFile: null,
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function PostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<PostFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const categoryNameById = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [postsRes, categoriesRes] = await Promise.all([
      supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true }),
    ]);

    if (postsRes.error || categoriesRes.error) {
      setError(
        postsRes.error?.message ||
          categoriesRes.error?.message ||
          "Failed to load",
      );
    } else {
      setPosts(postsRes.data ?? []);
      setCategories(categoriesRes.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const updateForm = <K extends keyof PostFormState>(
    key: K,
    value: PostFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(false);
  };

  const uploadImage = async (file: File) => {
    const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
    const timestampName = `${Date.now()}-${cleanName}`;
    const filePath = user ? `${user.id}/${timestampName}` : timestampName;

    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(filePath, file, { contentType: file.type || undefined });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("posts").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      let imageUrl: string | null = null;
      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile);
      }

      const payload = {
        category_id: form.category_id || null,
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        image_url: imageUrl,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", editingId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("posts")
          .insert(payload);
        if (insertError) throw insertError;
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (post: Post) => {
    setEditingId(post.id);
    setForm({
      name: post.name,
      price: String(post.price),
      description: post.description,
      category_id: post.category_id ?? "",
      imageFile: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);
    if (!deleteError) await loadData();
  };

  return (
    <div className="space-y-8 pt-0 mt-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mt-0 pt-0"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Posts
          </h1>
          <p className="text-slate-500 mt-1">Manage your product inventory</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          <span>{showForm ? "Close" : "New Post"}</span>
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                    <Package size={16} className="text-indigo-500" />
                    Product Name
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Enter product name"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                    <DollarSign size={16} className="text-indigo-500" />
                    Price
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="0.00"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                    <Tag size={16} className="text-indigo-500" />
                    Category
                  </span>
                  <select
                    value={form.category_id}
                    onChange={(e) => updateForm("category_id", e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                    <ImageIcon size={16} className="text-indigo-500" />
                    Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      updateForm("imageFile", e.target.files?.[0] || null)
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
                  />
                </label>
              </div>
            </div>

            <label className="block mt-6">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                <FileText size={16} className="text-indigo-500" />
                Description
              </span>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Describe your product..."
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
                    ? "Update Post"
                    : "Create Post"}
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

      {/* Posts Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 rounded-2xl p-4 h-64 animate-pulse"
            >
              <div className="h-40 bg-slate-200 rounded-xl mb-4" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            No posts yet. Create your first post!
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {post.image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-400" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {post.name}
                    </h3>
                    <span className="text-lg font-bold text-indigo-600">
                      {formatPrice(post.price)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mb-3">
                    {categoryNameById[post.category_id ?? ""] ||
                      "Uncategorized"}
                  </p>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {post.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(post)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Edit2 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(post.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
