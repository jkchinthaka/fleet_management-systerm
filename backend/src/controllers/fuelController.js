import { fuelService } from '../services/fuelService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const fuelController = {
  list: asyncHandler(async (req, res) => {
    const data = await fuelService.list(req.query);
    res.status(200).json({ success: true, data });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await fuelService.create(req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await fuelService.update(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),
  remove: asyncHandler(async (req, res) => {
    await fuelService.remove(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Fuel log deleted' });
  })
};
