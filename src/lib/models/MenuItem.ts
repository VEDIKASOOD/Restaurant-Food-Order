import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem extends Document {
    _id: mongoose.Types.ObjectId;
    restaurantId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
    {
        restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        image: { type: String },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Index for faster queries
MenuItemSchema.index({ restaurantId: 1, category: 1 });

const MenuItem: Model<IMenuItem> =
    mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
