import { asyncHandler } from '../utils/asyncHandler.js';
import { machineAssetService } from '../services/machineAssetService.js';

export const machineAssetController = {
  listMachines: asyncHandler(async (_req, res) => {
    const data = await machineAssetService.listMachines();
    res.status(200).json({ success: true, data });
  }),
  createMachine: asyncHandler(async (req, res) => {
    const data = await machineAssetService.createMachine(req.body);
    res.status(201).json({ success: true, data });
  }),
  updateMachine: asyncHandler(async (req, res) => {
    const data = await machineAssetService.updateMachine(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),

  listMachineServiceHistory: asyncHandler(async (_req, res) => {
    const data = await machineAssetService.listMachineServiceHistory();
    res.status(200).json({ success: true, data });
  }),
  createMachineServiceHistory: asyncHandler(async (req, res) => {
    const data = await machineAssetService.createMachineServiceHistory(req.body);
    res.status(201).json({ success: true, data });
  }),
  updateMachineServiceHistory: asyncHandler(async (req, res) => {
    const data = await machineAssetService.updateMachineServiceHistory(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),

  listMaintenanceSchedules: asyncHandler(async (_req, res) => {
    const data = await machineAssetService.listMaintenanceSchedules();
    res.status(200).json({ success: true, data });
  }),
  createMaintenanceSchedule: asyncHandler(async (req, res) => {
    const data = await machineAssetService.createMaintenanceSchedule(req.body);
    res.status(201).json({ success: true, data });
  }),
  updateMaintenanceSchedule: asyncHandler(async (req, res) => {
    const data = await machineAssetService.updateMaintenanceSchedule(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),

  listAssets: asyncHandler(async (_req, res) => {
    const data = await machineAssetService.listAssets();
    res.status(200).json({ success: true, data });
  }),
  createAsset: asyncHandler(async (req, res) => {
    const data = await machineAssetService.createAsset(req.body);
    res.status(201).json({ success: true, data });
  }),
  updateAsset: asyncHandler(async (req, res) => {
    const data = await machineAssetService.updateAsset(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),
  deleteMachine: asyncHandler(async (req, res) => {
    await machineAssetService.deleteMachine(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Machine deleted' });
  }),
  deleteMachineServiceHistory: asyncHandler(async (req, res) => {
    await machineAssetService.deleteMachineServiceHistory(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Machine service history deleted' });
  }),
  deleteMaintenanceSchedule: asyncHandler(async (req, res) => {
    await machineAssetService.deleteMaintenanceSchedule(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Maintenance schedule deleted' });
  }),
  deleteAsset: asyncHandler(async (req, res) => {
    await machineAssetService.deleteAsset(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Asset deleted' });
  })
};
