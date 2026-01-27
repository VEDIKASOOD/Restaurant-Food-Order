'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import styles from './cart.module.css';

export default function CartPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
    const [tableNumber, setTableNumber] = useState('');
    const [customerNote, setCustomerNote] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Initialize table number from URL params safely
    use(new Promise(resolve => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const table = params.get('table');
            if (table) setTableNumber(table);
        }
        resolve(null);
    }));

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: id,
                    items: items.map((item) => ({
                        menuItemId: item.menuItemId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                    tableNumber,
                    customerNote,
                    discountCode,
                }),
            });

            if (!response.ok) throw new Error('Failed to place order');

            const data = await response.json();
            setOrderId(data.order._id);
            setOrderSuccess(true);
            clearCart();
        } catch (error) {
            console.error('Order error:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderSuccess && orderId) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>✓</div>
                    <h2>Order Placed!</h2>
                    <p>Your order has been sent to the kitchen. Please wait for confirmation from the staff.</p>
                    <div className={styles.orderNumber}>
                        Order #{orderId.slice(-6).toUpperCase()}
                    </div>
                    <div className={styles.successActions}>
                        <Link href={`/restaurant/${id}`} className="btn btn-secondary">
                            Order More
                        </Link>
                        <Link href={`/restaurant/${id}/review/${orderId}`} className="btn btn-primary">
                            Leave a Review
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href={`/restaurant/${id}`} className={styles.backLink}>
                    ← Back to Menu
                </Link>
                <h1>Your Cart</h1>
            </header>

            {items.length === 0 ? (
                <div className={styles.emptyCart}>
                    <div className={styles.emptyIcon}>🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious items from the menu!</p>
                    <Link href={`/restaurant/${id}`} className="btn btn-primary">
                        Browse Menu
                    </Link>
                </div>
            ) : (
                <>
                    <div className={styles.cartItems}>
                        {items.map((item) => (
                            <div key={item.menuItemId} className={styles.cartItem}>
                                <div className={styles.itemInfo}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.itemPrice}>₹{item.price}</p>
                                </div>
                                <div className={styles.quantityControls}>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                    >
                                        −
                                    </button>
                                    <span className={styles.quantity}>{item.quantity}</span>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className={styles.itemTotal}>
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => removeItem(item.menuItemId)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.orderDetails}>
                        <div className={styles.formGroup}>
                            <label className="label">Table Number (Optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Table 5"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className="label">Special Instructions (Optional)</label>
                            <textarea
                                className={`input ${styles.textarea}`}
                                placeholder="Any allergies or special requests?"
                                value={customerNote}
                                onChange={(e) => setCustomerNote(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className="label">Promo Code (Optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="SAVE20-ABCD"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        className={`btn btn-primary ${styles.placeOrderBtn}`}
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner" style={{ width: 20, height: 20 }} />
                                Placing Order...
                            </>
                        ) : (
                            `Place Order • ₹${totalPrice.toFixed(2)}`
                        )}
                    </button>
                </>
            )}
        </div>
    );
}
