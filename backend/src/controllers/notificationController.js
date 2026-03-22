import { asyncHandler } from '../utils/asyncHandler.js';
import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  list: asyncHandler(async (_req, res) => {
    const data = await notificationService.list();
    res.status(200).json({ success: true, data });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await notificationService.create(req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await notificationService.update(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),
  remove: asyncHandler(async (req, res) => {
    await notificationService.remove(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Notification deleted' });
  }),
  markRead: asyncHandler(async (req, res) => {
    await notificationService.markRead(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  }),
  listThresholds: asyncHandler(async (_req, res) => {
    const data = await notificationService.listThresholds();
    res.status(200).json({ success: true, data });
  }),
  runEngine: asyncHandler(async (_req, res) => {
    const data = await notificationService.runThresholdEngine();
    res.status(200).json({ success: true, data, message: 'Alert engine executed' });
  })
};
