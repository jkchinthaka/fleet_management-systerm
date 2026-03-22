import { VehicleDocument } from '../models/index.js';

export const vehicleDocumentRepository = {
  findByVehicleId(vehicleId) {
    return VehicleDocument.find({ vehicle_id: Number(vehicleId) }).sort({ expiry_date: 1 }).lean();
  },
  findById(id) {
    return VehicleDocument.findOne({ id: Number(id) }).lean();
  },
  create(payload) {
    return new VehicleDocument(payload).save();
  },
  async updateById(id, payload) {
    return VehicleDocument.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },
  async deleteById(id) {
    return VehicleDocument.findOneAndDelete({ id: Number(id) });
  }
};
