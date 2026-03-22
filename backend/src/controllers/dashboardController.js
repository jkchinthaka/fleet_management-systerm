import { dashboardService } from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboardController = {
  summary: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getSummary();
    res.status(200).json({ success: true, data });
  })
};
