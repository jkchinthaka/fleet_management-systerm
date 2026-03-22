import { asyncHandler } from '../utils/asyncHandler.js';
import { attendanceService } from '../services/attendanceService.js';

export const attendanceController = {
  list: asyncHandler(async (req, res) => {
    const data = await attendanceService.list(req.query);
    res.status(200).json({ success: true, data });
  }),
  mark: asyncHandler(async (req, res) => {
    const payload = {
      ...req.body,
      user_id: req.user.sub,
      user_email: req.user.email
    };
    const data = await attendanceService.mark(payload);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await attendanceService.update(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),
  remove: asyncHandler(async (req, res) => {
    await attendanceService.remove(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Attendance record deleted' });
  }),
  monthlySummary: asyncHandler(async (req, res) => {
    const data = await attendanceService.monthlySummary(req.query.yearMonth);
    res.status(200).json({ success: true, data });
  })
};
