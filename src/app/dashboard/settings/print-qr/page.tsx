'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import * as QRCode from 'qrcode';
import styles from './print.module.css';

export default function PrintQRPage() {
    const { data: session } = useSession();
    const [restaurantName, setRestaurantName] = useState('Restaurant');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [tableNumber, setTableNumber] = useState('');

    // Get table number from URL properly
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const table = params.get('table');
            if (table) setTableNumber(table);
        }
    }, []);

    useEffect(() => {
        if (session?.user?.id) {
            fetchRestaurant();
        }
    }, [session]);

    // Generate QR when dependencies change
    useEffect(() => {
        if (session?.user?.id) {
            const baseUrl = `${window.location.origin}/restaurant/${session?.user?.id}`;
            const url = tableNumber ? `${baseUrl}?table=${tableNumber}` : baseUrl;
            generateQRCode(url);
        }
    }, [session, tableNumber]);

    const fetchRestaurant = async () => {
        try {
            const res = await fetch(`/api/restaurants/${session?.user?.id}`);
            const data = await res.json();
            setRestaurantName(data.restaurant.name);
        } catch (error) {
            console.error('Failed to fetch restaurant details');
        }
    };

    const generateQRCode = async (url: string) => {
        try {
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });
            setQrCodeUrl(qrDataUrl);
        } catch (error) {
            console.error('Failed to generate QR code');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.header} no-print`}>
                <div>
                    <h1>Print QR Card</h1>
                    <p>Preview and print your table card</p>
                </div>
                <button className="btn btn-primary" onClick={handlePrint}>
                    🖨️ Print
                </button>
            </div>

            <div className={styles.preview}>
                <div className={styles.cardContent}>
                    <h2 className={styles.restaurantName}>{restaurantName}</h2>
                    <p className={styles.cta}>Scan to Order</p>

                    {qrCodeUrl && (
                        <div className={styles.qrImage}>
                            <img src={qrCodeUrl} alt="QR Code" width={300} height={300} />
                        </div>
                    )}

                    {tableNumber && (
                        <div className={styles.tableNumber}>
                            Table {tableNumber}
                        </div>
                    )}

                    <p className={styles.footer}>Browse Menu • Order • Pay</p>
                </div>
            </div>
        </div>
    );
}
