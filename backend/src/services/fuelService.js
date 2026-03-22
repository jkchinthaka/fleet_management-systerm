import { fuelRepository } from '../repositories/fuelRepository.js';
import { ApiError } from '../utils/ApiError.js';

const calculateEfficiency = (fuelQuantity, mileage) => {
  if (!fuelQuantity || fuelQuantity <= 0) return 0;
  return Number((mileage / fuelQuantity).toFixed(2));
};

export const fuelService = {
  list(filters) {
    return fuelRepository.findAll(filters);
  },
  create(payload) {
    const fuel_efficiency = calculateEfficiency(payload.fuel_quantity, payload.mileage);
    return fuelRepository.create({ ...payload, fuel_efficiency });
  },
  async update(id, payload) {
    const existing = await fuelRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Fuel log not found');

    const nextFuelQuantity = payload.fuel_quantity ?? existing.fuel_quantity;
    const nextMileage = payload.mileage ?? existing.mileage;
    const fuel_efficiency = calculateEfficiency(nextFuelQuantity, nextMileage);

    await fuelRepository.updateById(id, { ...payload, fuel_efficiency });
    return fuelRepository.findById(id);
  },
  async remove(id) {
    const count = await fuelRepository.deleteById(id);
    if (!count) throw new ApiError(404, 'Fuel log not found');
    return true;
  }
};
