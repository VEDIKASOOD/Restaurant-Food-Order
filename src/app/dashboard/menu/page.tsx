'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from '../dashboard.module.css';
import menuStyles from './menu.module.css';

interface MenuItem {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    isAvailable: boolean;
}

export default function MenuPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
    });

    useEffect(() => {
        if (session?.user?.id) {
            fetchMenuItems();
        }
    }, [session]);

    const fetchMenuItems = async () => {
        try {
            const res = await fetch(`/api/menu?restaurantId=${session?.user?.id}`);
            const data = await res.json();
            setItems(data.items || []);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingItem) {
                await fetch(`/api/menu/${editingItem._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        price: parseFloat(formData.price),
                    }),
                });
            } else {
                await fetch('/api/menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        price: parseFloat(formData.price),
                        restaurantId: session?.user?.id,
                    }),
                });
            }

            resetForm();
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to save item:', error);
        }
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            category: item.category,
            image: item.image || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await fetch(`/api/menu/${id}`, { method: 'DELETE' });
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const toggleAvailability = async (item: MenuItem) => {
        try {
            await fetch(`/api/menu/${item._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !item.isAvailable }),
            });
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to toggle availability:', error);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingItem(null);
        setFormData({ name: '', description: '', price: '', category: '', image: '' });
    };

    const categories = [...new Set(items.map((item) => item.category))];

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <div className={menuStyles.header}>
                <div>
                    <h1>Menu Management</h1>
                    <p>Add, edit, and manage your menu items</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                >
                    + Add Item
                </button>
            </div>

            {showForm && (
                <div className={menuStyles.modal}>
                    <div className={menuStyles.modalContent}>
                        <div className={menuStyles.modalHeader}>
                            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                            <button className={menuStyles.closeBtn} onClick={resetForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={menuStyles.form}>
                            <div className={menuStyles.formGroup}>
                                <label className="label">Item Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Margherita Pizza"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={menuStyles.formRow}>
                                <div className={menuStyles.formGroup}>
                                    <label className="label">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="299"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className={menuStyles.formGroup}>
                                    <label className="label">Category</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Pizza, Drinks"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                        list="categories"
                                    />
                                    <datalist id="categories">
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                            <div className={menuStyles.formGroup}>
                                <label className="label">Description (Optional)</label>
                                <textarea
                                    className="input"
                                    placeholder="Describe the item..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className={menuStyles.formGroup}>
                                <label className="label">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    className="input"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className={menuStyles.formActions}>
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingItem ? 'Save Changes' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {items.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        No menu items yet. Add your first item to get started!
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        + Add First Item
                    </button>
                </div>
            ) : (
                <div className={menuStyles.menuGrid}>
                    {items.map((item) => (
                        <div key={item._id} className={`${menuStyles.menuCard} ${!item.isAvailable ? menuStyles.unavailable : ''}`}>
                            {item.image && (
                                <div className={menuStyles.cardImage}>
                                    <img src={item.image} alt={item.name} />
                                </div>
                            )}
                            <div className={menuStyles.cardContent}>
                                <div className={menuStyles.cardHeader}>
                                    <h3>{item.name}</h3>
                                    <span className={menuStyles.price}>₹{item.price}</span>
                                </div>
                                <span className={menuStyles.category}>{item.category}</span>
                                {item.description && (
                                    <p className={menuStyles.description}>{item.description}</p>
                                )}
                                <div className={menuStyles.cardActions}>
                                    <label className={menuStyles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={item.isAvailable}
                                            onChange={() => toggleAvailability(item)}
                                        />
                                        <span className={menuStyles.toggleSlider}></span>
                                        <span className={menuStyles.toggleLabel}>
                                            {item.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    </label>
                                    <div className={menuStyles.actionBtns}>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleEdit(item)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleDelete(item._id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
