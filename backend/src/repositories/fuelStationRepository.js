import { FuelStation } from '../models/index.js';

export const fuelStationRepository = {
  async findAll(filters = {}) {
    const query = {};
    if (filters.createdBy) query.created_by = filters.createdBy;
    if (filters.isFavorite !== undefined) query.is_favorite = filters.isFavorite === 'true';
    return FuelStation.find(query).sort({ name: 1 }).lean();
  },

  async findById(id) {
    return FuelStation.findOne({ id: Number(id) }).lean();
  },

  create(payload) {
    return new FuelStation(payload).save();
  },

  async updateById(id, payload) {
    return FuelStation.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  async deleteById(id) {
    return FuelStation.findOneAndDelete({ id: Number(id) });
  }
};
