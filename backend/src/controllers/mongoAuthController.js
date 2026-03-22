import { asyncHandler } from '../utils/asyncHandler.js';
import { mongoAuthService } from '../services/mongoAuthService.js';

export const mongoAuthController = {
  login: asyncHandler(async (req, res) => {
    const data = await mongoAuthService.login(req.body);
    res.status(200).json({ success: true, data });
  }),

  me: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: req.authUser });
  }),

  adminOnly: asyncHandler(async (_req, res) => {
    res.status(200).json({ success: true, message: 'Admin access granted' });
  })
};
