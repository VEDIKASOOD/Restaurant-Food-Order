import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurant extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
    description?: string;
    operatingHours: {
        open: string;
        close: string;
    };
    qrCodeUrl?: string;
    discountConfig: {
        enabled: boolean;
        percentage: number;
        minOrderAmount: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        description: { type: String },
        operatingHours: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '22:00' },
        },
        qrCodeUrl: { type: String },
        discountConfig: {
            enabled: { type: Boolean, default: false },
            percentage: { type: Number, default: 10 },
            minOrderAmount: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

const Restaurant: Model<IRestaurant> =
    mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

export default Restaurant;
