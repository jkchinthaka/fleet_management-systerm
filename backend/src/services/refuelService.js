import { refuelRepository } from '../repositories/refuelRepository.js';
import { Vehicle } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

export const refuelService = {
  list(filters) {
    return refuelRepository.findAll(filters);
  },

  async create(payload, userId) {
    const vehicle = await Vehicle.findOne({ id: Number(payload.vehicle_id) }).lean();
    if (!vehicle) {
      throw new ApiError(400, 'Vehicle not found. Add the vehicle first before creating a refuel log.');
    }

    // Auto-calculate total_cost if price_per_litre and fuel_volume are given but total_cost is not
    if (!payload.total_cost && payload.price_per_litre && payload.fuel_volume) {
      payload.total_cost = Number((payload.fuel_volume * payload.price_per_litre).toFixed(2));
    }
    payload.created_by = userId;
    return refuelRepository.create(payload);
  },

  async getById(id) {
    const log = await refuelRepository.findById(id);
    if (!log) throw new ApiError(404, 'Refuel log not found');
    return log;
  },

  async update(id, payload, userId) {
    const existing = await refuelRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Refuel log not found');

    if (payload.vehicle_id != null) {
      const vehicle = await Vehicle.findOne({ id: Number(payload.vehicle_id) }).lean();
      if (!vehicle) {
        throw new ApiError(400, 'Vehicle not found. Add the vehicle first before assigning a refuel log.');
      }
    }

    // Recalculate total_cost when volume or price changes
    const vol = payload.fuel_volume ?? existing.fuel_volume;
    const ppl = payload.price_per_litre ?? existing.price_per_litre;
    if (vol && ppl && payload.total_cost == null) {
      payload.total_cost = Number((vol * ppl).toFixed(2));
    }

    payload.updated_by = userId;
    await refuelRepository.updateById(id, payload);
    return refuelRepository.findById(id);
  },

  async approve(id, userId, approved) {
    const existing = await refuelRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Refuel log not found');

    const update = {
      status: approved ? 'Approved' : 'Rejected',
      approved_by: userId,
      approved_at: new Date()
    };
    await refuelRepository.updateById(id, update);
    return refuelRepository.findById(id);
  },

  async remove(id) {
    const count = await refuelRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Refuel log not found');
    return true;
  }
};
