'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from '../dashboard.module.css';
import orderStyles from './orders.module.css';

interface Order {
    _id: string;
    items: { name: string; quantity: number; price: number }[];
    totalPrice: number;
    status: string;
    tableNumber?: string;
    customerNote?: string;
    createdAt: string;
}

export default function OrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetchOrders();
        }
    }, [session]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders?restaurantId=${session?.user?.id}`);
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 15000); // Poll every 15 seconds
            return () => clearInterval(interval);
        }
    }, [session]);

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'badge-warning',
            confirmed: 'badge-primary',
            preparing: 'badge-primary',
            ready: 'badge-success',
            completed: 'badge-success',
            cancelled: 'badge-error',
        };
        return statusMap[status] || 'badge-primary';
    };

    const getNextStatus = (current: string): string | null => {
        const flow: Record<string, string> = {
            pending: 'confirmed',
            confirmed: 'preparing',
            preparing: 'ready',
            ready: 'completed',
        };
        return flow[current] || null;
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Orders</h1>
                    <p>Manage incoming orders from customers</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="spinner" style={{ width: 8, height: 8, borderWidth: 2 }}></span>
                        Live Updates
                    </span>
                    <button className="btn btn-secondary" onClick={() => fetchOrders()}>
                        ↻ Refresh
                    </button>
                </div>
            </div>

            <div className={orderStyles.filters}>
                {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed'].map((f) => (
                    <button
                        key={f}
                        className={`${orderStyles.filterBtn} ${filter === f ? orderStyles.active : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'pending' && orders.filter((o) => o.status === 'pending').length > 0 && (
                            <span className={orderStyles.count}>
                                {orders.filter((o) => o.status === 'pending').length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No {filter === 'all' ? '' : filter} orders found.
                    </p>
                </div>
            ) : (
                <div className={orderStyles.ordersGrid}>
                    {filteredOrders.map((order) => (
                        <div key={order._id} className={orderStyles.orderCard}>
                            <div className={orderStyles.orderHeader}>
                                <span className={orderStyles.orderId}>
                                    #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <span className={`badge ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {order.tableNumber && (
                                <div className={orderStyles.tableNumber}>
                                    📍 {order.tableNumber}
                                </div>
                            )}

                            <div className={orderStyles.orderItems}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className={orderStyles.item}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {order.customerNote && (
                                <div className={orderStyles.note}>
                                    <strong>Note:</strong> {order.customerNote}
                                </div>
                            )}

                            <div className={orderStyles.orderFooter}>
                                <div className={orderStyles.total}>
                                    Total: ₹{order.totalPrice.toFixed(2)}
                                </div>
                                <div className={orderStyles.time}>
                                    {new Date(order.createdAt).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className={orderStyles.actions}>
                                {getNextStatus(order.status) && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => updateOrderStatus(order._id, getNextStatus(order.status)!)}
                                    >
                                        Mark as {getNextStatus(order.status)}
                                    </button>
                                )}
                                {order.status === 'pending' && (
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
