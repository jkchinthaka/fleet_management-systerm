import { machineAssetRepository } from '../repositories/machineAssetRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const machineAssetService = {
  listMachines() {
    return machineAssetRepository.listMachines();
  },
  createMachine(payload) {
    return machineAssetRepository.createMachine(payload);
  },
  async updateMachine(id, payload) {
    const updated = await machineAssetRepository.updateMachine(id, payload);
    if (!updated) throw new ApiError(404, 'Machine not found');
    return updated;
  },

  listMachineServiceHistory() {
    return machineAssetRepository.listMachineServiceHistory();
  },
  createMachineServiceHistory(payload) {
    return machineAssetRepository.createMachineServiceHistory(payload);
  },
  async updateMachineServiceHistory(id, payload) {
    const updated = await machineAssetRepository.updateMachineServiceHistory(id, payload);
    if (!updated) throw new ApiError(404, 'Machine service history not found');
    return updated;
  },

  listMaintenanceSchedules() {
    return machineAssetRepository.listMaintenanceSchedules();
  },
  createMaintenanceSchedule(payload) {
    return machineAssetRepository.createMaintenanceSchedule(payload);
  },
  async updateMaintenanceSchedule(id, payload) {
    const updated = await machineAssetRepository.updateMaintenanceSchedule(id, payload);
    if (!updated) throw new ApiError(404, 'Maintenance schedule not found');
    return updated;
  },

  listAssets() {
    return machineAssetRepository.listAssets();
  },
  createAsset(payload) {
    return machineAssetRepository.createAsset(payload);
  },
  async updateAsset(id, payload) {
    const updated = await machineAssetRepository.updateAsset(id, payload);
    if (!updated) throw new ApiError(404, 'Asset not found');
    return updated;
  },
  async deleteMachine(id) {
    const count = await machineAssetRepository.deleteMachine(id);
    if (!count) throw new ApiError(404, 'Machine not found');
    return true;
  },
  async deleteMachineServiceHistory(id) {
    const count = await machineAssetRepository.deleteMachineServiceHistory(id);
    if (!count) throw new ApiError(404, 'Machine service history not found');
    return true;
  },
  async deleteMaintenanceSchedule(id) {
    const count = await machineAssetRepository.deleteMaintenanceSchedule(id);
    if (!count) throw new ApiError(404, 'Maintenance schedule not found');
    return true;
  },
  async deleteAsset(id) {
    const count = await machineAssetRepository.deleteAsset(id);
    if (!count) throw new ApiError(404, 'Asset not found');
    return true;
  }
};
