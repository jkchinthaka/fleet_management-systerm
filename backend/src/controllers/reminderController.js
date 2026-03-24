import { reminderService } from '../services/reminderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reminderController = {
  list: asyncHandler(async (req, res) => {
    const data = await reminderService.list(req.query);
    res.status(200).json({ success: true, data });
  }),

  upcoming: asyncHandler(async (req, res) => {
    const days = Number(req.query.days) || 7;
    const data = await reminderService.upcoming(days);
    res.status(200).json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await reminderService.getById(Number(req.params.id));
    res.status(200).json({ success: true, data });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await reminderService.create(req.body, req.user.sub);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const data = await reminderService.update(Number(req.params.id), req.body, req.user.sub);
    res.status(200).json({ success: true, data });
  }),

  complete: asyncHandler(async (req, res) => {
    const data = await reminderService.complete(Number(req.params.id));
    res.status(200).json({ success: true, data });
  }),

  remove: asyncHandler(async (req, res) => {
    await reminderService.remove(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Reminder deleted' });
  })
};
