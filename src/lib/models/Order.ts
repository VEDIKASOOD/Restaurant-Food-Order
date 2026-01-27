import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface IOrderItem {
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
}

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    restaurantId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalPrice: number;
    status: OrderStatus;
    tableNumber?: string;
    customerNote?: string;
    discountApplied: number;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        items: { type: [OrderItemSchema], required: true },
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
            default: 'pending',
        },
        tableNumber: { type: String },
        customerNote: { type: String },
        discountApplied: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Index for faster queries
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });

const Order: Model<IOrder> =
    mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
