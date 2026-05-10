import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Save,
  UtensilsCrossed,
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
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyItem);
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
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Unique categories in current menu
  const activeCats = [...new Set(menuItems.map((i) => i.category))];

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(emptyItem);
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
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || (!formData.price && formData.sizes.length === 0)) {
      setToast({ message: 'Please fill in name and price', type: 'error' });
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
        setToast({ message: 'Item updated!', type: 'success' });
      } else {
        await addMenuItem(data);
        setToast({ message: 'Item added!', type: 'success' });
      }
      setShowModal(false);
    } catch (err) {
      console.error('Save failed:', err);
      setToast({ message: 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      setDeleteConfirm(null);
      setToast({ message: 'Item deleted', type: 'success' });
    } catch (err) {
      console.error('Delete failed:', err);
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const handleToggleAvailability = async (id, current) => {
    try {
      await toggleAvailability(id, !current);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Menu Management
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-surface-400)' }}>
            {menuItems.length} items · {menuItems.filter((i) => i.isAvailable).length} available
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-surface-500)' }} />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="select"
          style={{ maxWidth: '200px' }}
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {MENU_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Items table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state py-16 glass-card">
          <UtensilsCrossed size={48} />
          <p className="font-semibold">No items found</p>
          <p className="text-sm">Add your first menu item to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-3 flex items-center gap-3"
                style={{
                  borderRadius: '12px',
                  opacity: item.isAvailable ? 1 : 0.5,
                }}
              >
                <div className={item.type === 'veg' ? 'veg-indicator' : 'nonveg-indicator'} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-surface-400)' }}>
                      {item.category}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs truncate" style={{ color: 'var(--color-surface-500)' }}>
                      {item.description}
                    </p>
                  )}
                </div>

                <span className="text-sm font-bold" style={{ color: 'var(--color-primary-400)' }}>
                  {formatCurrency(item.price)}
                </span>

                {/* Availability toggle */}
                <button
                  className={`toggle ${item.isAvailable ? 'active' : ''}`}
                  onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                  title={item.isAvailable ? 'In Stock' : 'Out of Stock'}
                />

                {/* Actions */}
                <button
                  onClick={() => openEditModal(item)}
                  className="btn btn-ghost btn-icon btn-sm"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  className="btn btn-ghost btn-icon btn-sm"
                  style={{ color: 'var(--color-status-rejected)' }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon btn-sm">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="input-label">Item Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Margherita Pizza"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Price (₹) *</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="input-label">Type</label>
                    <select
                      className="select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Category</label>
                  <select
                    className="select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {MENU_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Description (optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Brief description or ingredients"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <button
                    className={`toggle ${formData.isAvailable ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                    type="button"
                  />
                  <span className="text-sm font-medium">
                    {formData.isAvailable ? 'Available (In Stock)' : 'Unavailable (Out of Stock)'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? (
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  ) : (
                    <>
                      <Save size={16} />
                      {editingItem ? 'Update' : 'Add Item'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="modal-content text-center"
              style={{ maxWidth: '380px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                <Trash2 size={24} style={{ color: '#f87171' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Delete Item?
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-surface-400)' }}>
                This action cannot be undone. The item will be permanently removed from the menu.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost flex-1">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn btn-danger flex-1">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
