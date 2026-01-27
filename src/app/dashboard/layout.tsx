'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import AuthProvider from '@/components/AuthProvider';
import styles from './dashboard.module.css';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className={styles.loading}>
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const navItems = [
        { href: '/dashboard', label: 'Overview', icon: '📊' },
        { href: '/dashboard/orders', label: 'Orders', icon: '🛒' },
        { href: '/dashboard/menu', label: 'Menu', icon: '📋' },
        { href: '/dashboard/reviews', label: 'Reviews', icon: '⭐' },
        { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.logo}>🍽️ QR Food</Link>
                    <p className={styles.restaurantName}>{session.user?.name}</p>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''
                                }`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <button
                    className={styles.logoutBtn}
                    onClick={() => signOut({ callbackUrl: '/' })}
                >
                    🚪 Log Out
                </button>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <DashboardContent>{children}</DashboardContent>
        </AuthProvider>
    );
}
