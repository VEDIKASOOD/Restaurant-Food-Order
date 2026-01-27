'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';

interface Stats {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    avgRating: number;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        avgRating: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Array<{
        _id: string;
        items: { name: string; quantity: number }[];
        totalPrice: number;
        status: string;
        createdAt: string;
    }>>([]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchDashboardData();
        }
    }, [session]);

    const fetchDashboardData = async () => {
        try {
            // Fetch orders
            const ordersRes = await fetch(`/api/orders?restaurantId=${session?.user?.id}`);
            const ordersData = await ordersRes.json();

            // Fetch reviews
            const reviewsRes = await fetch(`/api/reviews?restaurantId=${session?.user?.id}`);
            const reviewsData = await reviewsRes.json();

            const orders = ordersData.orders || [];
            setRecentOrders(orders.slice(0, 5));

            setStats({
                totalOrders: orders.length,
                pendingOrders: orders.filter((o: { status: string }) => o.status === 'pending').length,
                totalRevenue: orders.reduce((sum: number, o: { totalPrice: number }) => sum + o.totalPrice, 0),
                avgRating: reviewsData.stats?.avgRestaurantRating || 0,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    };

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

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1>Dashboard</h1>
                <p>Welcome back! Here&apos;s what&apos;s happening with your restaurant.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Total Orders</h3>
                    <div className={styles.statValue}>{stats.totalOrders}</div>
                </div>
                <div className={styles.statCard}>
                    <h3>Pending Orders</h3>
                    <div className={`${styles.statValue} ${styles.primary}`}>
                        {stats.pendingOrders}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <h3>Total Revenue</h3>
                    <div className={styles.statValue}>₹{stats.totalRevenue.toFixed(0)}</div>
                </div>
                <div className={styles.statCard}>
                    <h3>Avg. Rating</h3>
                    <div className={styles.statValue}>
                        {stats.avgRating > 0 ? `${stats.avgRating} ⭐` : 'N/A'}
                    </div>
                </div>
            </div>

            <div className={styles.pageHeader}>
                <h2>Recent Orders</h2>
            </div>

            {recentOrders.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order) => (
                            <tr key={order._id}>
                                <td>#{order._id.slice(-6).toUpperCase()}</td>
                                <td>
                                    {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                                </td>
                                <td>₹{order.totalPrice.toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No orders yet. Share your QR code to start receiving orders!
                    </p>
                </div>
            )}
        </div>
    );
}
