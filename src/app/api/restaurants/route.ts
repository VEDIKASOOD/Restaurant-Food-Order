import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Restaurant from '@/lib/models/Restaurant';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { name, email, password, address, phone, description, operatingHours } = body;

        // Validation
        if (!name || !email || !password || !address || !phone) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if restaurant already exists
        const existingRestaurant = await Restaurant.findOne({ email });
        if (existingRestaurant) {
            return NextResponse.json(
                { error: 'Restaurant with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create restaurant
        const restaurant = await Restaurant.create({
            name,
            email,
            password: hashedPassword,
            address,
            phone,
            description,
            operatingHours: operatingHours || { open: '09:00', close: '22:00' },
        });

        // Remove password from response
        const restaurantResponse = {
            _id: restaurant._id,
            name: restaurant.name,
            email: restaurant.email,
            address: restaurant.address,
            phone: restaurant.phone,
        };

        return NextResponse.json(
            { message: 'Restaurant registered successfully', restaurant: restaurantResponse },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
