import { vehicleService } from '../services/vehicleService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const vehicleController = {
  list: asyncHandler(async (req, res) => {
    const data = await vehicleService.list(req.query);
    res.status(200).json({ success: true, data });
  }),
  getById: asyncHandler(async (req, res) => {
    const data = await vehicleService.getById(Number(req.params.id));
    res.status(200).json({ success: true, data });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await vehicleService.create(req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await vehicleService.update(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),
  remove: asyncHandler(async (req, res) => {
    const data = await vehicleService.remove(Number(req.params.id));
    res.status(200).json({ success: true, data });
  })
};
