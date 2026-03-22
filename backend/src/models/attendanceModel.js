import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const attendanceSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    user_id: { type: String, required: true },
    user_email: { type: String },
    attendance_date: { type: Date, required: true },
    check_in: { type: String },
    check_out: { type: String },
    status: { type: String, default: 'Present' },
    location: { type: String }
  },
  { timestamps: false, versionKey: false }
);

attendanceSchema.plugin(autoIncrementPlugin, { modelName: 'user_attendance' });

export const Attendance = mongoose.model('Attendance', attendanceSchema, 'user_attendance');
