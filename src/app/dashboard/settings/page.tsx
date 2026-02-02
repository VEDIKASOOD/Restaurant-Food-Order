'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import * as QRCode from 'qrcode';
import styles from '../dashboard.module.css';
import settingsStyles from './settings.module.css';

interface Restaurant {
    _id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
    description?: string;
    operatingHours: {
        open: string;
        close: string;
    };
    discountConfig: {
        enabled: boolean;
        percentage: number;
        minOrderAmount: number;
    };
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [qrUrl, setQrUrl] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        description: '',
        openTime: '09:00',
        closeTime: '22:00',
        discountEnabled: false,
        discountPercentage: 10,
        minOrderAmount: 0,
    });

    const fetchRestaurant = useCallback(async () => {
        try {
            const res = await fetch(`/api/restaurants/${session?.user?.id}`);
            const data = await res.json();
            const r = data.restaurant;
            setRestaurant(r);
            setFormData({
                name: r.name,
                address: r.address,
                phone: r.phone,
                description: r.description || '',
                openTime: r.operatingHours?.open || '09:00',
                closeTime: r.operatingHours?.close || '22:00',
                discountEnabled: r.discountConfig?.enabled || false,
                discountPercentage: r.discountConfig?.percentage || 10,
                minOrderAmount: r.discountConfig?.minOrderAmount || 0,
            });
        } catch (error) {
            console.error('Failed to fetch restaurant:', error);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);

    const generateQRCode = useCallback(async (url: string) => {
        try {
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#FF6B35',
                    light: '#1A1A2E',
                },
            });
            setQrCodeUrl(qrDataUrl);
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        }
    }, []);

    useEffect(() => {
        if (session?.user?.id) {
            fetchRestaurant();
        }
    }, [session, fetchRestaurant]);

    useEffect(() => {
        if (session?.user?.id) {
            const baseUrl = `${window.location.origin}/restaurant/${session?.user?.id}`;
            const url = tableNumber ? `${baseUrl}?table=${tableNumber}` : baseUrl;
            setQrUrl(url);
            generateQRCode(url);
        }
    }, [session, tableNumber, generateQRCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await fetch(`/api/restaurants/${session?.user?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address,
                    phone: formData.phone,
                    description: formData.description,
                    operatingHours: {
                        open: formData.openTime,
                        close: formData.closeTime,
                    },
                    discountConfig: {
                        enabled: formData.discountEnabled,
                        percentage: formData.discountPercentage,
                        minOrderAmount: formData.minOrderAmount,
                    },
                }),
            });
            setMessage('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save:', error);
            setMessage('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const downloadQRCode = () => {
        const link = document.createElement('a');
        link.download = `${restaurant?.name || 'restaurant'}-qr-code.png`;
        link.href = qrCodeUrl;
        link.click();
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
                <h1>Settings</h1>
                <p>Manage your restaurant profile and preferences</p>
            </div>

            <div className={settingsStyles.grid}>
                {/* QR Code Section */}
                <div className={settingsStyles.qrSection}>
                    <h2>Your QR Code</h2>
                    <p>Customers can scan this to view your menu</p>
                    {qrCodeUrl && (
                        <div className={settingsStyles.qrCode}>
                            <img src={qrCodeUrl} alt="Restaurant QR Code" />
                        </div>
                    )}
                    <button className="btn btn-primary" onClick={downloadQRCode}>
                        Download QR Code
                    </button>
                    <a
                        href={`/dashboard/settings/print-qr${tableNumber ? `?table=${tableNumber}` : ''}`}
                        className="btn btn-secondary"
                        target="_blank"
                    >
                        🖨️ Print Card
                    </a>
                    <div className={settingsStyles.qrControls}>
                        <div className={settingsStyles.formGroup}>
                            <label className="label">Table Number (Optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., 5"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={settingsStyles.menuLink}>
                        <label className="label">Menu URL</label>
                        <input
                            type="text"
                            className="input"
                            value={qrUrl}
                            readOnly
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                    </div>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSubmit} className={settingsStyles.form}>
                    {message && (
                        <div className={`${settingsStyles.message} ${message.includes('Failed') ? settingsStyles.error : ''}`}>
                            {message}
                        </div>
                    )}

                    <div className={settingsStyles.section}>
                        <h3>Restaurant Details</h3>
                        <div className={settingsStyles.formGroup}>
                            <label className="label">Restaurant Name</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className={settingsStyles.formGroup}>
                            <label className="label">Address</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className={settingsStyles.formGroup}>
                            <label className="label">Phone</label>
                            <input
                                type="tel"
                                className="input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className={settingsStyles.formGroup}>
                            <label className="label">Description</label>
                            <textarea
                                className="input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className={settingsStyles.section}>
                        <h3>Operating Hours</h3>
                        <div className={settingsStyles.formRow}>
                            <div className={settingsStyles.formGroup}>
                                <label className="label">Opening Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.openTime}
                                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                                />
                            </div>
                            <div className={settingsStyles.formGroup}>
                                <label className="label">Closing Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={formData.closeTime}
                                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={settingsStyles.section}>
                        <h3>Discount Settings</h3>
                        <label className={settingsStyles.checkbox}>
                            <input
                                type="checkbox"
                                checked={formData.discountEnabled}
                                onChange={(e) => setFormData({ ...formData, discountEnabled: e.target.checked })}
                            />
                            <span>Enable discount rewards for reviews</span>
                        </label>

                        {formData.discountEnabled && (
                            <div className={settingsStyles.formRow}>
                                <div className={settingsStyles.formGroup}>
                                    <label className="label">Discount Percentage</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.discountPercentage}
                                        onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) })}
                                        min="1"
                                        max="100"
                                    />
                                </div>
                                <div className={settingsStyles.formGroup}>
                                    <label className="label">Min Order Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
