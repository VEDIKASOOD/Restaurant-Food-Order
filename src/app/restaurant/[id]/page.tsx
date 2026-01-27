'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import styles from './page.module.css';

interface MenuItem {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    isAvailable: boolean;
}

interface MenuCategory {
    category: string;
    items: MenuItem[];
}

interface Restaurant {
    _id: string;
    name: string;
    address: string;
    phone: string;
    description?: string;
    operatingHours: {
        open: string;
        close: string;
    };
}

export default function RestaurantMenuPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<MenuCategory[]>([]);

    const [activeCategory, setActiveCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addItem, totalItems, totalPrice } = useCart();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredMenu = menu.map(category => ({
        ...category,
        items: category.items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/restaurants/${id}`);
                if (!res.ok) throw new Error('Restaurant not found');
                const data = await res.json();
                setRestaurant(data.restaurant);
                setMenu(data.menu);
                if (data.menu.length > 0) {
                    setActiveCategory(data.menu[0].category);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load restaurant');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    useEffect(() => {
        if (searchQuery && filteredMenu.length > 0) {
            const currentCategoryExists = filteredMenu.find(c => c.category === activeCategory);
            if (!currentCategoryExists) {
                setActiveCategory(filteredMenu[0].category);
            }
        }
    }, [searchQuery, filteredMenu, activeCategory]);

    const handleAddToCart = (item: MenuItem) => {
        addItem({
            menuItemId: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner" />
                <p>Loading menu...</p>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>🍽️</div>
                <h2>Restaurant Not Found</h2>
                <p>{error || 'This restaurant does not exist'}</p>
                <Link href="/" className="btn btn-primary">
                    Go Home
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Restaurant Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>{restaurant.name}</h1>
                    <p className={styles.address}>📍 {restaurant.address}</p>
                    <p className={styles.hours}>
                        🕐 {restaurant.operatingHours.open} - {restaurant.operatingHours.close}
                    </p>
                    {restaurant.description && (
                        <p className={styles.description}>{restaurant.description}</p>
                    )}
                </div>
            </header>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="🔍 Search for dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Category Tabs */}
            <nav className={styles.categoryNav}>
                <div className={styles.categoryTabs}>
                    {filteredMenu.map((cat) => (
                        <button
                            key={cat.category}
                            className={`${styles.categoryTab} ${activeCategory === cat.category ? styles.active : ''
                                }`}
                            onClick={() => setActiveCategory(cat.category)}
                        >
                            {cat.category}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Menu Items */}
            <main className={styles.menuGrid}>
                {filteredMenu.length === 0 ? (
                    <div className={styles.noResults}>
                        <p>No items found for &quot;{searchQuery}&quot;</p>
                    </div>
                ) : (
                    filteredMenu
                        .find((cat) => cat.category === activeCategory)
                        ?.items.map((item) => (
                            <div key={item._id} className={styles.menuItem}>
                                {item.image && (
                                    <div className={styles.itemImage}>
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                )}
                                <div className={styles.itemContent}>
                                    <div className={styles.itemHeader}>
                                        <h3>{item.name}</h3>
                                        <span className={styles.price}>₹{item.price}</span>
                                    </div>
                                    {item.description && (
                                        <p className={styles.itemDescription}>{item.description}</p>
                                    )}
                                    <button
                                        className={`btn btn-primary ${styles.addButton}`}
                                        onClick={() => handleAddToCart(item)}
                                        disabled={!item.isAvailable}
                                    >
                                        {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                                    </button>
                                </div>
                            </div>
                        ))
                )}
            </main>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <Link href={`/restaurant/${id}/cart`} className={styles.floatingCart}>
                    <div className={styles.cartInfo}>
                        <span className={styles.cartCount}>{totalItems} items</span>
                        <span className={styles.cartTotal}>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <span className={styles.cartAction}>View Cart →</span>
                </Link>
            )}
        </div>
    );
}
