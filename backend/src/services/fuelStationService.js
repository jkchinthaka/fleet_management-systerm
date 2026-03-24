import { fuelStationRepository } from '../repositories/fuelStationRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const fuelStationService = {
  list(filters) {
    return fuelStationRepository.findAll(filters);
  },

  create(payload, userId) {
    payload.created_by = userId;
    return fuelStationRepository.create(payload);
  },

  async update(id, payload) {
    const existing = await fuelStationRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Fuel station not found');
    await fuelStationRepository.updateById(id, payload);
    return fuelStationRepository.findById(id);
  },

  async remove(id) {
    const count = await fuelStationRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Fuel station not found');
    return true;
  }
};
