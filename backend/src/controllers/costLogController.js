import { costLogService } from '../services/costLogService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

export const costLogController = {
  list: asyncHandler(async (req, res) => {
    const data = await costLogService.list(req.query);
    res.status(200).json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await costLogService.getById(Number(req.params.id));
    res.status(200).json({ success: true, data });
  }),

  create: asyncHandler(async (req, res) => {
    const payload = { ...req.body };

    if (payload.attachment) {
      const result = await uploadImage(payload.attachment, 'cost_attachments');
      if (result) {
        payload.attachment_url = result.url;
        payload.attachment_public_id = result.public_id;
      }
      delete payload.attachment;
    }

    const data = await costLogService.create(payload, req.user.sub);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const payload = { ...req.body };

    if (payload.attachment) {
      const result = await uploadImage(payload.attachment, 'cost_attachments');
      if (result) {
        payload.attachment_url = result.url;
        payload.attachment_public_id = result.public_id;
      }
      delete payload.attachment;
    }

    const data = await costLogService.update(Number(req.params.id), payload, req.user.sub);
    res.status(200).json({ success: true, data });
  }),

  approve: asyncHandler(async (req, res) => {
    const approved = req.body.approved !== false;
    const data = await costLogService.approve(Number(req.params.id), req.user.sub, approved);
    res.status(200).json({ success: true, data });
  }),

  remove: asyncHandler(async (req, res) => {
    const existing = await costLogService.getById(Number(req.params.id));
    if (existing?.attachment_public_id) {
      await deleteImage(existing.attachment_public_id);
    }
    await costLogService.remove(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Cost log deleted' });
  })
};
