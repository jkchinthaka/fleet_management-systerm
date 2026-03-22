import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const stockMovementSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    product_id: { type: Number, required: true },
    movement_type: { type: String, required: true },
    quantity: { type: Number, required: true },
    movement_date: { type: Date },
    reference_type: { type: String },
    reference_id: { type: Number },
    notes: { type: String }
  },
  { timestamps: false, versionKey: false }
);

stockMovementSchema.plugin(autoIncrementPlugin, { modelName: 'stock_movements' });

export const StockMovement = mongoose.model('StockMovement', stockMovementSchema, 'stock_movements');
