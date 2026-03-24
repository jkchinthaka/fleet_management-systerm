import { RefuelLog, Vehicle } from '../models/index.js';

export const refuelRepository = {
  async findAll(filters = {}) {
    const query = {};
    if (filters.vehicleId) query.vehicle_id = Number(filters.vehicleId);
    if (filters.createdBy) query.created_by = filters.createdBy;
    if (filters.status) query.status = filters.status;
    if (filters.fuelType) query.fuel_type = filters.fuelType;
    if (filters.from || filters.to) {
      query.log_date = {};
      if (filters.from) query.log_date.$gte = new Date(filters.from);
      if (filters.to) query.log_date.$lte = new Date(filters.to);
    }

    const logs = await RefuelLog.find(query).sort({ id: -1 }).lean();
    const vehicleIds = [...new Set(logs.map((l) => l.vehicle_id))];
    const vehicles = await Vehicle.find({ id: { $in: vehicleIds } }).lean();
    const vMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
    return logs.map((l) => ({ ...l, vehicle: vMap[l.vehicle_id] || null }));
  },

  async findById(id) {
    const log = await RefuelLog.findOne({ id: Number(id) }).lean();
    if (!log) return null;
    const vehicle = await Vehicle.findOne({ id: log.vehicle_id }).lean();
    return { ...log, vehicle };
  },

  create(payload) {
    return new RefuelLog(payload).save();
  },

  async updateById(id, payload) {
    return RefuelLog.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  async deleteById(id) {
    return RefuelLog.findOneAndDelete({ id: Number(id) });
  }
};
