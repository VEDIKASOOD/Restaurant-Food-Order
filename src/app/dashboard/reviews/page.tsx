'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from '../dashboard.module.css';
import reviewStyles from './reviews.module.css';

interface Review {
    _id: string;
    foodRating: number;
    restaurantRating: number;
    comment?: string;
    createdAt: string;
}

interface Stats {
    totalReviews: number;
    avgFoodRating: number;
    avgRestaurantRating: number;
}

export default function ReviewsPage() {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalReviews: 0,
        avgFoodRating: 0,
        avgRestaurantRating: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?restaurantId=${session?.user?.id}`);
                const data = await res.json();
                setReviews(data.reviews || []);
                setStats(data.stats || { totalReviews: 0, avgFoodRating: 0, avgRestaurantRating: 0 });
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchReviews();
        }
    }, [session]);

    const renderStars = (rating: number) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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
                <h1>Reviews</h1>
                <p>See what customers are saying about your restaurant</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Total Reviews</h3>
                    <div className={styles.statValue}>{stats.totalReviews}</div>
                </div>
                <div className={styles.statCard}>
                    <h3>Food Rating</h3>
                    <div className={`${styles.statValue} ${styles.primary}`}>
                        {stats.avgFoodRating > 0 ? `${stats.avgFoodRating} ⭐` : 'N/A'}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <h3>Overall Rating</h3>
                    <div className={`${styles.statValue} ${styles.primary}`}>
                        {stats.avgRestaurantRating > 0 ? `${stats.avgRestaurantRating} ⭐` : 'N/A'}
                    </div>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No reviews yet. Customers can leave reviews after completing their orders.
                    </p>
                </div>
            ) : (
                <div className={reviewStyles.reviewsList}>
                    {reviews.map((review) => (
                        <div key={review._id} className={reviewStyles.reviewCard}>
                            <div className={reviewStyles.ratings}>
                                <div className={reviewStyles.ratingItem}>
                                    <span className={reviewStyles.ratingLabel}>Food</span>
                                    <span className={reviewStyles.stars}>{renderStars(review.foodRating)}</span>
                                </div>
                                <div className={reviewStyles.ratingItem}>
                                    <span className={reviewStyles.ratingLabel}>Overall</span>
                                    <span className={reviewStyles.stars}>{renderStars(review.restaurantRating)}</span>
                                </div>
                            </div>
                            {review.comment && (
                                <p className={reviewStyles.comment}>&ldquo;{review.comment}&rdquo;</p>
                            )}
                            <div className={reviewStyles.date}>
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
