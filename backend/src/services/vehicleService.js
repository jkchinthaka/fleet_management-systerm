import { vehicleRepository } from '../repositories/vehicleRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const vehicleService = {
  list(filters) {
    return vehicleRepository.findAll(filters);
  },
  getById(id) {
    return vehicleRepository.findById(id);
  },
  create(payload) {
    return vehicleRepository.create(payload);
  },
  async update(id, payload) {
    const updated = await vehicleRepository.updateById(id, payload);
    if (!updated) throw new ApiError(404, 'Vehicle not found');
    return updated;
  },
  async remove(id) {
    const count = await vehicleRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Vehicle not found');
    return { deleted: true };
  }
};
