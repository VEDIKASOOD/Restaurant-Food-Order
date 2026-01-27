import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
    _id: mongoose.Types.ObjectId;
    restaurantId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    foodRating: number;
    restaurantRating: number;
    comment?: string;
    discountEarned: number;
    discountCode?: string;
    isRedeemed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
        foodRating: { type: Number, required: true, min: 1, max: 5 },
        restaurantRating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        discountEarned: { type: Number, default: 0 },
        discountCode: { type: String, unique: true, sparse: true },
        isRedeemed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for faster queries
ReviewSchema.index({ restaurantId: 1, createdAt: -1 });

const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
