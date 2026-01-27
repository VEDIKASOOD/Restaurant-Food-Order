import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Restaurant from '@/lib/models/Restaurant';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');
        const status = searchParams.get('status');

        if (!restaurantId) {
            return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
        }

        const query: Record<string, unknown> = { restaurantId };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { restaurantId, items, tableNumber, customerNote, discountCode } = body;

        if (!restaurantId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Please provide restaurant ID and items' },
                { status: 400 }
            );
        }

        // Calculate total price
        let totalPrice = items.reduce(
            (sum: number, item: { price: number; quantity: number }) =>
                sum + item.price * item.quantity,
            0
        );

        // Check for discount
        // Check for discount
        let discountApplied = 0;
        if (discountCode) {
            const review = await import('@/lib/models/Review').then(mod => mod.default.findOne({ discountCode }));

            if (!review) {
                return NextResponse.json({ error: 'Invalid discount code' }, { status: 400 });
            }

            if (review.isRedeemed) {
                return NextResponse.json({ error: 'Discount code already used' }, { status: 400 });
            }

            // Verify restaurant match if needed, or assume global for simplicity within system (but best to check restaurantId)
            if (review.restaurantId.toString() !== restaurantId) {
                return NextResponse.json({ error: 'Invalid discount code for this restaurant' }, { status: 400 });
            }

            // Calculate discount based on usage
            const restaurant = await Restaurant.findById(restaurantId);
            if (restaurant && totalPrice >= restaurant.discountConfig.minOrderAmount) {
                discountApplied = (totalPrice * review.discountEarned) / 100;
                totalPrice -= discountApplied;

                // Mark as redeemed
                review.isRedeemed = true;
                await review.save();
            } else {
                return NextResponse.json({ error: `Minimum order of ₹${restaurant?.discountConfig.minOrderAmount} required` }, { status: 400 });
            }
        }

        const order = await Order.create({
            restaurantId,
            items,
            totalPrice,
            tableNumber,
            customerNote,
            discountApplied,
            status: 'pending',
        });

        return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
