import { Vehicle } from '../models/index.js';
import { FuelLog } from '../models/index.js';

export const vehicleRepository = {
  async findAll(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.branch) query.branch = filters.branch;
    return Vehicle.find(query).sort({ id: -1 }).lean();
  },

  async findById(id) {
    const vehicle = await Vehicle.findOne({ id: Number(id) }).lean();
    if (!vehicle) return null;
    const fuelLogs = await FuelLog.find({ vehicle_id: Number(id) }).sort({ id: -1 }).lean();
    return { ...vehicle, fuelLogs };
  },

  create(payload) {
    return new Vehicle(payload).save();
  },

  async updateById(id, payload) {
    return Vehicle.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  async deleteById(id) {
    return Vehicle.findOneAndDelete({ id: Number(id) });
  }
};
