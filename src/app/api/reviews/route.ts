import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import Restaurant from '@/lib/models/Restaurant';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');

        if (!restaurantId) {
            return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
        }

        const reviews = await Review.find({ restaurantId }).sort({ createdAt: -1 });

        // Calculate average ratings
        const avgFoodRating =
            reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.foodRating, 0) / reviews.length
                : 0;
        const avgRestaurantRating =
            reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.restaurantRating, 0) / reviews.length
                : 0;

        return NextResponse.json({
            reviews,
            stats: {
                totalReviews: reviews.length,
                avgFoodRating: Math.round(avgFoodRating * 10) / 10,
                avgRestaurantRating: Math.round(avgRestaurantRating * 10) / 10,
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { restaurantId, orderId, foodRating, restaurantRating, comment } = body;

        if (!restaurantId || !orderId || !foodRating || !restaurantRating) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if review already exists for this order
        const existingReview = await Review.findOne({ orderId });
        if (existingReview) {
            return NextResponse.json(
                { error: 'Review already submitted for this order' },
                { status: 400 }
            );
        }

        // Check if restaurant has discount enabled
        const restaurant = await Restaurant.findById(restaurantId);
        let discountCode;
        let discountEarned = 0;
        if (restaurant?.discountConfig.enabled) {
            discountEarned = restaurant.discountConfig.percentage;
            // Generate a simple 8-character code
            const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
            discountCode = `SAVE${restaurant.discountConfig.percentage}-${randomStr}`;
        }

        const review = await Review.create({
            restaurantId,
            orderId,
            foodRating,
            restaurantRating,
            comment,
            discountEarned,
            discountCode,
        });

        return NextResponse.json(
            {
                review,
                message: discountEarned > 0
                    ? `Thank you! You earned a ${discountEarned}% discount. Your code is: ${discountCode}`
                    : 'Thank you for your review!',
                discountCode,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
