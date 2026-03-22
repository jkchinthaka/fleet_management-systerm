import mongoose from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement.js';

const vehicleDocumentSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    vehicle_id: { type: Number, required: true },
    document_type: { type: String, required: true },
    document_number: { type: String },
    expiry_date: { type: Date },
    file_url: { type: String }
  },
  { timestamps: false, versionKey: false }
);

vehicleDocumentSchema.plugin(autoIncrementPlugin, { modelName: 'vehicle_documents' });

export const VehicleDocument = mongoose.model('VehicleDocument', vehicleDocumentSchema, 'vehicle_documents');
