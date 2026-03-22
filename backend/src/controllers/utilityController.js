import { asyncHandler } from '../utils/asyncHandler.js';
import { utilityService } from '../services/utilityService.js';

export const utilityController = {
  listWater: asyncHandler(async (_req, res) => {
    const data = await utilityService.listWater();
    res.status(200).json({ success: true, data });
  }),
  createWater: asyncHandler(async (req, res) => {
    const data = await utilityService.createWater(req.body);
    res.status(201).json({ success: true, data });
  }),
  updateWater: asyncHandler(async (req, res) => {
    const data = await utilityService.updateWater(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),

  listElectricity: asyncHandler(async (_req, res) => {
    const data = await utilityService.listElectricity();
    res.status(200).json({ success: true, data });
  }),
  createElectricity: asyncHandler(async (req, res) => {
    const data = await utilityService.createElectricity(req.body);
    res.status(201).json({ success: true, data });
  }),
  updateElectricity: asyncHandler(async (req, res) => {
    const data = await utilityService.updateElectricity(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),

  comparison: asyncHandler(async (_req, res) => {
    const data = await utilityService.getComparison();
    res.status(200).json({ success: true, data });
  })
};
