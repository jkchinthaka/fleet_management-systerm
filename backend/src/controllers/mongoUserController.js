import { asyncHandler } from '../utils/asyncHandler.js';
import { mongoUserService } from '../services/mongoUserService.js';

export const mongoUserController = {
  list: asyncHandler(async (_req, res) => {
    const data = await mongoUserService.list();
    res.status(200).json({ success: true, data });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await mongoUserService.create(req.body);
    res.status(201).json({ success: true, data });
  })
};
