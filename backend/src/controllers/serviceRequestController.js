import { serviceRequestService } from '../services/serviceRequestService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const serviceRequestController = {
  list: asyncHandler(async (req, res) => {
    const data = await serviceRequestService.list();
    res.status(200).json({ success: true, data });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await serviceRequestService.create(req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await serviceRequestService.update(Number(req.params.id), req.body);
    res.status(200).json({ success: true, data });
  }),
  updateStatus: asyncHandler(async (req, res) => {
    const data = await serviceRequestService.updateStatus(Number(req.params.id), req.body.status, {
      userId: req.user.sub,
      roleId: req.user.roleId
    });
    res.status(200).json({ success: true, data });
  }),
  listTasks: asyncHandler(async (req, res) => {
    const data = await serviceRequestService.listTasks(req.query.serviceRequestId ? Number(req.query.serviceRequestId) : undefined);
    res.status(200).json({ success: true, data });
  }),
  addTask: asyncHandler(async (req, res) => {
    const data = await serviceRequestService.addTask(req.body, {
      userId: req.user.sub,
      roleId: req.user.roleId
    });
    res.status(201).json({ success: true, data });
  }),
  addSparePart: asyncHandler(async (req, res) => {
    const data = await serviceRequestService.addSparePart(req.body, {
      userId: req.user.sub,
      roleId: req.user.roleId
    });
    res.status(201).json({ success: true, data });
  }),
  slaOverview: asyncHandler(async (_req, res) => {
    const data = await serviceRequestService.slaOverview();
    res.status(200).json({ success: true, data });
  }),
  approveClosure: asyncHandler(async (req, res) => {
    const data = await serviceRequestService.approveClosure(Number(req.params.id), {
      userId: req.user.sub,
      roleId: req.user.roleId
    });
    res.status(200).json({ success: true, data });
  }),
  remove: asyncHandler(async (req, res) => {
    await serviceRequestService.remove(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Service request deleted' });
  }),
  removeTask: asyncHandler(async (req, res) => {
    await serviceRequestService.removeTask(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Service task deleted' });
  }),
  removeSparePart: asyncHandler(async (req, res) => {
    await serviceRequestService.removeSparePart(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Spare part deleted' });
  })
};
