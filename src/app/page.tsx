import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>🍽️ QR Food Ordering</span>
          <h1 className={styles.title}>
            Scan. Order. <span className={styles.highlight}>Enjoy.</span>
          </h1>
          <p className={styles.description}>
            Transform your dining experience with our seamless QR-based ordering system.
            No waiting, no hassle – just great food at your fingertips.
          </p>
          <div className={styles.actions}>
            <Link href="/auth/register" className="btn btn-primary">
              Register Your Restaurant
            </Link>
            <Link href="/auth/login" className="btn btn-secondary">
              Restaurant Login
            </Link>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📱</div>
            <h3>Scan QR Code</h3>
            <p>Customers scan the QR code at their table to access your digital menu instantly</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛒</div>
            <h3>Easy Ordering</h3>
            <p>Browse menu items, add to cart, and place orders with just a few taps</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⭐</div>
            <h3>Reviews & Rewards</h3>
            <p>Collect customer feedback and reward loyalty with automatic discounts</p>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 QR Food Order. Digital menus for modern restaurants.</p>
      </footer>
    </main>
  );
}
