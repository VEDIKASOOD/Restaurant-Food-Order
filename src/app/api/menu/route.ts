import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/lib/models/MenuItem';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');

        if (!restaurantId) {
            return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
        }

        const menuItems = await MenuItem.find({ restaurantId });

        // Group items by category
        const categories = [...new Set(menuItems.map((item) => item.category))];
        const menuByCategory = categories.map((category) => ({
            category,
            items: menuItems.filter((item) => item.category === category),
        }));

        return NextResponse.json({ menu: menuByCategory, items: menuItems });
    } catch (error) {
        console.error('Get menu error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { restaurantId, name, description, price, category, image } = body;

        if (!restaurantId || !name || !price || !category) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        const menuItem = await MenuItem.create({
            restaurantId,
            name,
            description,
            price,
            category,
            image,
            isAvailable: true,
        });

        return NextResponse.json({ menuItem }, { status: 201 });
    } catch (error) {
        console.error('Create menu item error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
