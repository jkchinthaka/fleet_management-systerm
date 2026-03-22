import { vehicleDocumentRepository } from '../repositories/vehicleDocumentRepository.js';

export const vehicleDocumentService = {
  async listByVehicle(vehicleId) {
    return vehicleDocumentRepository.findByVehicleId(vehicleId);
  },
  async getById(id) {
    const doc = await vehicleDocumentRepository.findById(id);
    if (!doc) throw Object.assign(new Error('Vehicle document not found'), { statusCode: 404 });
    return doc;
  },
  async create(vehicleId, payload) {
    return vehicleDocumentRepository.create({ ...payload, vehicle_id: vehicleId });
  },
  async update(id, payload) {
    await this.getById(id);
    await vehicleDocumentRepository.updateById(id, payload);
    return vehicleDocumentRepository.findById(id);
  },
  async remove(id) {
    await this.getById(id);
    return vehicleDocumentRepository.deleteById(id);
  }
};
