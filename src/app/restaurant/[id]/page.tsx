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

    // Generate placeholder image based on category
    const getPlaceholderImage = (category: string): string => {
        const placeholders: { [key: string]: string } = {
            pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
            burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
            pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
            drinks: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=400&fit=crop',
            dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop',
            salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
            appetizer: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=400&h=400&fit=crop',
            curry: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop',
            rice: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=400&h=400&fit=crop',
            noodles: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop',
            sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop',
            soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',
            chicken: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop',
            seafood: 'https://images.unsplash.com/photo-1559737558-2f5a70b8e25f?w=400&h=400&fit=crop',
            biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop',
            default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
        };

        const categoryLower = category.toLowerCase();

        // Check for exact match or partial match
        for (const key in placeholders) {
            if (categoryLower.includes(key) || key.includes(categoryLower)) {
                return placeholders[key];
            }
        }

        return placeholders.default;
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
                                <div className={styles.itemImage}>
                                    <img
                                        src={item.image || getPlaceholderImage(item.category)}
                                        alt={item.name}
                                        onError={(e) => {
                                            // Fallback to default placeholder if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.src = getPlaceholderImage(item.category);
                                        }}
                                    />
                                </div>
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
