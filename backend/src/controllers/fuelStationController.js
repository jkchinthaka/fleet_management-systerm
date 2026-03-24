import { fuelStationService } from '../services/fuelStationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const fuelStationController = {
  list: asyncHandler(async (req, res) => {
    const data = await fuelStationService.list(req.query);
    res.status(200).json({ success: true, data });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await fuelStationService.create(req.body, req.user.sub);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const data = await fuelStationService.update(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),

  remove: asyncHandler(async (req, res) => {
    await fuelStationService.remove(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Fuel station deleted' });
  })
};
