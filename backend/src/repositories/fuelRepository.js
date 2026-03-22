import { FuelLog } from '../models/index.js';
import { Vehicle } from '../models/index.js';

export const fuelRepository = {
  async findAll(filters = {}) {
    const query = {};
    if (filters.vehicleId) query.vehicle_id = Number(filters.vehicleId);
    const logs = await FuelLog.find(query).sort({ id: -1 }).lean();
    const vehicleIds = [...new Set(logs.map((l) => l.vehicle_id))];
    const vehicles = await Vehicle.find({ id: { $in: vehicleIds } }).lean();
    const vMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
    return logs.map((l) => ({ ...l, vehicle: vMap[l.vehicle_id] || null }));
  },

  async findById(id) {
    const log = await FuelLog.findOne({ id: Number(id) }).lean();
    if (!log) return null;
    const vehicle = await Vehicle.findOne({ id: log.vehicle_id }).lean();
    return { ...log, vehicle };
  },

  create(payload) {
    return new FuelLog(payload).save();
  },

  async updateById(id, payload) {
    return FuelLog.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  async deleteById(id) {
    return FuelLog.findOneAndDelete({ id: Number(id) });
  }
};
