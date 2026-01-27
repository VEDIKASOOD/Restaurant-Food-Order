'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import styles from './review.module.css';

export default function ReviewPage({
    params,
}: {
    params: Promise<{ id: string; orderId: string }>;
}) {
    const { id, orderId } = use(params);
    const [foodRating, setFoodRating] = useState(0);
    const [restaurantRating, setRestaurantRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [discountMessage, setDiscountMessage] = useState('');

    const handleSubmit = async () => {
        if (foodRating === 0 || restaurantRating === 0) {
            alert('Please provide both ratings');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: id,
                    orderId,
                    foodRating,
                    restaurantRating,
                    comment,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit review');

            const data = await response.json();
            setDiscountMessage(data.message);
            setSubmitted(true);
        } catch (error) {
            console.error('Review error:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({
        value,
        onChange,
        label,
    }: {
        value: number;
        onChange: (v: number) => void;
        label: string;
    }) => (
        <div className={styles.ratingGroup}>
            <label className={styles.ratingLabel}>{label}</label>
            <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`${styles.star} ${star <= value ? styles.active : ''}`}
                        onClick={() => onChange(star)}
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>
    );

    if (submitted) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>🎉</div>
                    <h2>Thank You!</h2>
                    <p>{discountMessage}</p>
                    <div className={styles.actions}>
                        <Link href={`/restaurant/${id}`} className="btn btn-primary">
                            Order Again
                        </Link>
                        <a
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                        >
                            Review on Google Maps
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Rate Your Experience</h1>
                <p>Your feedback helps us improve!</p>
            </header>

            <div className={styles.form}>
                <StarRating
                    value={foodRating}
                    onChange={setFoodRating}
                    label="How was the food?"
                />

                <StarRating
                    value={restaurantRating}
                    onChange={setRestaurantRating}
                    label="Overall experience?"
                />

                <div className={styles.commentGroup}>
                    <label className="label">Comments (Optional)</label>
                    <textarea
                        className={`input ${styles.textarea}`}
                        placeholder="Tell us what you loved or what we can improve..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />
                </div>

                <button
                    className={`btn btn-primary ${styles.submitBtn}`}
                    onClick={handleSubmit}
                    disabled={isSubmitting || foodRating === 0 || restaurantRating === 0}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>

                <Link href={`/restaurant/${id}`} className={styles.skipLink}>
                    Skip for now
                </Link>
            </div>
        </div>
    );
}
