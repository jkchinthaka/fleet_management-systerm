import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const notificationSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    module: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, default: 'Info' },
    is_read: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

notificationSchema.plugin(autoIncrementPlugin, { modelName: 'notifications' });

export const Notification = mongoose.model('Notification', notificationSchema, 'notifications');
