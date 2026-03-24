import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const reminderSchema = new mongoose.Schema(
  {
    id:                { type: Number, unique: true },
    vehicle_id:        { type: Number, required: true },
    reminder_type:     { type: String, required: true, enum: ['Insurance', 'Maintenance', 'Registration', 'Inspection', 'TyreChange', 'OilChange', 'Custom'] },
    title:             { type: String, required: true, maxlength: 200 },
    description:       { type: String, maxlength: 500 },
    due_date:          { type: Date, required: true },
    recurrence:        { type: String, enum: ['None', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'], default: 'None' },
    recurrence_end:    { type: Date },
    is_completed:      { type: Boolean, default: false },
    completed_at:      { type: Date },
    notify_before_days:{ type: Number, default: 7 },
    assigned_to:       { type: String },                    // userId
    // Audit fields
    created_by:        { type: String },
    updated_by:        { type: String }
  },
  { timestamps: true, versionKey: false }
);

reminderSchema.index({ vehicle_id: 1, due_date: 1 });
reminderSchema.index({ assigned_to: 1, is_completed: 1 });
reminderSchema.index({ due_date: 1, is_completed: 1 });

reminderSchema.plugin(autoIncrementPlugin, { modelName: 'reminders' });

export const Reminder = mongoose.model('Reminder', reminderSchema, 'reminders');
