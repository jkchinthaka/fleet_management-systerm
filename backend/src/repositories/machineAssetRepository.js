import {
  Machine, MachineServiceHistory, MachineMaintenanceSchedule, Asset
} from '../models/index.js';

export const machineAssetRepository = {
  async listMachines() {
    const machines = await Machine.find().sort({ id: -1 }).lean();
    for (const m of machines) {
      m.serviceHistory = await MachineServiceHistory.find({ machine_id: m.id }).lean();
      m.maintenanceSchedules = await MachineMaintenanceSchedule.find({ machine_id: m.id }).lean();
    }
    return machines;
  },

  async findMachineById(id) {
    const machine = await Machine.findOne({ id: Number(id) }).lean();
    if (!machine) return null;
    machine.serviceHistory = await MachineServiceHistory.find({ machine_id: Number(id) }).lean();
    machine.maintenanceSchedules = await MachineMaintenanceSchedule.find({ machine_id: Number(id) }).lean();
    return machine;
  },

  createMachine(payload) {
    return new Machine(payload).save();
  },

  updateMachine(id, payload) {
    return Machine.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  listMachineServiceHistory() {
    return MachineServiceHistory.find().sort({ service_date: -1 }).lean();
  },

  findMachineServiceHistoryById(id) {
    return MachineServiceHistory.findOne({ id: Number(id) }).lean();
  },

  createMachineServiceHistory(payload) {
    return new MachineServiceHistory(payload).save();
  },

  updateMachineServiceHistory(id, payload) {
    return MachineServiceHistory.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  listMaintenanceSchedules() {
    return MachineMaintenanceSchedule.find().sort({ due_date: 1 }).lean();
  },

  findMaintenanceScheduleById(id) {
    return MachineMaintenanceSchedule.findOne({ id: Number(id) }).lean();
  },

  createMaintenanceSchedule(payload) {
    return new MachineMaintenanceSchedule(payload).save();
  },

  updateMaintenanceSchedule(id, payload) {
    return MachineMaintenanceSchedule.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  listAssets() {
    return Asset.find().sort({ id: -1 }).lean();
  },

  findAssetById(id) {
    return Asset.findOne({ id: Number(id) }).lean();
  },

  createAsset(payload) {
    return new Asset(payload).save();
  },

  updateAsset(id, payload) {
    return Asset.findOneAndUpdate({ id: Number(id) }, payload, { new: true });
  },

  deleteMachine(id) {
    return Machine.findOneAndDelete({ id: Number(id) });
  },

  deleteMachineServiceHistory(id) {
    return MachineServiceHistory.findOneAndDelete({ id: Number(id) });
  },

  deleteMaintenanceSchedule(id) {
    return MachineMaintenanceSchedule.findOneAndDelete({ id: Number(id) });
  },

  deleteAsset(id) {
    return Asset.findOneAndDelete({ id: Number(id) });
  }
};
