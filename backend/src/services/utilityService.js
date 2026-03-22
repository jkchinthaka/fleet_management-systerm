import { utilityRepository } from '../repositories/utilityRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const utilityService = {
  listWater() {
    return utilityRepository.listWater();
  },
  async createWater(payload) {
    const meterLocation = payload.meter_location.trim();
    const existing = await utilityRepository.findWaterByDateAndLocation(payload.reading_date, meterLocation);

    if (existing) {
      await utilityRepository.updateWater(existing.id, {
        units_consumed: payload.units_consumed,
        cost: payload.cost,
        meter_location: meterLocation
      });
      return utilityRepository.findWaterById(existing.id);
    }

    return utilityRepository.createWater({
      ...payload,
      meter_location: meterLocation
    });
  },
  async updateWater(id, payload) {
    const updated = await utilityRepository.updateWater(id, payload);
    if (!updated) throw new ApiError(404, 'Water reading not found');
    return updated;
  },
  listElectricity() {
    return utilityRepository.listElectricity();
  },
  async createElectricity(payload) {
    const meterLocation = payload.meter_location.trim();
    const existing = await utilityRepository.findElectricityByDateAndLocation(payload.reading_date, meterLocation);

    if (existing) {
      await utilityRepository.updateElectricity(existing.id, {
        units_consumed: payload.units_consumed,
        cost: payload.cost,
        meter_location: meterLocation
      });
      return utilityRepository.findElectricityById(existing.id);
    }

    return utilityRepository.createElectricity({
      ...payload,
      meter_location: meterLocation
    });
  },
  async updateElectricity(id, payload) {
    const updated = await utilityRepository.updateElectricity(id, payload);
    if (!updated) throw new ApiError(404, 'Electricity reading not found');
    return updated;
  },
  getComparison() {
    return utilityRepository.getMonthlyComparison();
  }
};
