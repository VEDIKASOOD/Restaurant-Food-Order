import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Restaurant from '@/lib/models/Restaurant';
import MenuItem from '@/lib/models/MenuItem';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const restaurant = await Restaurant.findById(id).select('-password');
        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // Get menu items for this restaurant
        const menuItems = await MenuItem.find({ restaurantId: id, isAvailable: true });

        // Group items by category
        const categories = [...new Set(menuItems.map((item) => item.category))];
        const menuByCategory = categories.map((category) => ({
            category,
            items: menuItems.filter((item) => item.category === category),
        }));

        return NextResponse.json({
            restaurant,
            menu: menuByCategory,
        });
    } catch (error) {
        console.error('Get restaurant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        ).select('-password');

        if (!updatedRestaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        return NextResponse.json({ restaurant: updatedRestaurant });
    } catch (error) {
        console.error('Update restaurant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
