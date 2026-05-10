import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Save,
  UtensilsCrossed,
  Package,
  CircleDot,
  ChefHat,
} from 'lucide-react';
import {
  subscribeToMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from '../../services/menuService';
import { formatCurrency, MENU_CATEGORIES } from '../../utils/formatters';
import Toast from '../../components/UI/Toast';

const emptyItem = {
  name: '',
  price: '',
  category: MENU_CATEGORIES[0],
  type: 'veg',
  description: '',
  isAvailable: true,
  sizes: [],
};

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyItem);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToMenu((items) => {
      setMenuItems(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const availableItems = menuItems.filter((item) => item.isAvailable).length;
  const vegItems = menuItems.filter((item) => item.type === 'veg').length;
  const nonVegItems = menuItems.filter((item) => item.type === 'non-veg').length;

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(emptyItem);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      type: item.type,
      description: item.description || '',
      isAvailable: item.isAvailable,
      sizes: item.sizes || [],
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Item name is required';
    }
    if (formData.sizes.length === 0) {
      if (formData.price === '' || formData.price === null) {
        nextErrors.price = 'Price is required';
      } else if (Number(formData.price) <= 0) {
        nextErrors.price = 'Price must be greater than 0';
      }
    }
    if (!formData.category) {
      nextErrors.category = 'Please select a category';
    }
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name.trim(),
        price: Number(formData.price) || 0,
        category: formData.category,
        type: formData.type,
        description: formData.description.trim(),
        isAvailable: formData.isAvailable,
      };
      if (formData.sizes.length > 0) {
        data.sizes = formData.sizes;
      }

      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
        setToast({ message: 'Item updated successfully', type: 'success' });
      } else {
        await addMenuItem(data);
        setToast({ message: 'Item added successfully', type: 'success' });
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save failed:', error);
      setToast({ message: 'Failed to save item', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      setDeleteConfirm(null);
      setToast({ message: 'Item deleted', type: 'success' });
    } catch (error) {
      console.error('Delete failed:', error);
      setToast({ message: 'Failed to delete item', type: 'error' });
    }
  };

  const handleToggleAvailability = async (id, current) => {
    try {
      await toggleAvailability(id, !current);
      setToast({
        message: `Item marked as ${!current ? 'available' : 'unavailable'}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Toggle availability failed:', error);
      setToast({ message: 'Failed to update availability', type: 'error' });
    }
  };

  const formatUpdatedAt = (timestamp) => {
    if (!timestamp) return '--';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Menu Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage pricing, stock status, and categories with a clean admin table.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-primary-700"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          icon={Package}
          label="Total Items"
          value={menuItems.length}
          color="bg-primary-50 text-primary-700"
        />
        <StatCard
          icon={ChefHat}
          label="Available Now"
          value={availableItems}
          color="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={CircleDot}
          label="Veg / Non-Veg"
          value={`${vegItems} / ${nonVegItems}`}
          color="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Search by item name..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <select
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
          >
            <option value="all">All Categories</option>
            {MENU_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">All Types</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="skeleton h-12" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 text-center">
          <UtensilsCrossed size={44} className="text-slate-400" />
          <p className="mt-3 text-base font-semibold text-slate-800">No matching menu items</p>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting filters or add a new item.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Item</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Availability</th>
                  <th className="px-4 py-3 text-left font-semibold">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="line-clamp-1 text-xs text-slate-500">
                          {item.description || 'No description'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.type === 'veg'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              item.type === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                          className={`inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold transition-all duration-200 hover:scale-[1.02] ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatUpdatedAt(item.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-100"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition-all duration-200 hover:scale-[1.02] hover:bg-rose-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors duration-200 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => {
                      setFormData({ ...formData, name: event.target.value });
                      setFormErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    placeholder="e.g. Smoky Peri Peri Pizza"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                  {formErrors.name ? (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(event) => {
                        setFormData({ ...formData, price: event.target.value });
                        setFormErrors((prev) => ({ ...prev, price: '' }));
                      }}
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                    {formErrors.price ? (
                      <p className="mt-1 text-xs text-rose-600">{formErrors.price}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(event) => {
                      setFormData({ ...formData, category: event.target.value });
                      setFormErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  >
                    {MENU_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {formErrors.category ? (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.category}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(event) =>
                      setFormData({ ...formData, description: event.target.value })
                    }
                    placeholder="Highlight ingredients, spice level, or chef notes..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={() =>
                      setFormData({ ...formData, isAvailable: !formData.isAvailable })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Mark as available for ordering
                  </span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <span className="spinner h-4 w-4 !border-2 !border-white/40 !border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete this item?</h3>
              <p className="mt-2 text-sm text-slate-500">
                This action cannot be undone and will remove the item from your menu.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 text-sm font-semibold text-white transition-colors duration-200 hover:bg-rose-700"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon size={17} />
        </span>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
