import { refuelService } from '../services/refuelService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

export const refuelController = {
  list: asyncHandler(async (req, res) => {
    const data = await refuelService.list(req.query);
    res.status(200).json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await refuelService.getById(Number(req.params.id));
    res.status(200).json({ success: true, data });
  }),

  create: asyncHandler(async (req, res) => {
    const payload = { ...req.body };

    // Handle photo upload (base64)
    if (payload.photo) {
      const result = await uploadImage(payload.photo, 'refuel_receipts');
      if (result) {
        payload.photo_url = result.url;
        payload.photo_public_id = result.public_id;
      }
      delete payload.photo;
    }

    const data = await refuelService.create(payload, req.user.sub);
    res.status(201).json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const payload = { ...req.body };

    if (payload.photo) {
      const result = await uploadImage(payload.photo, 'refuel_receipts');
      if (result) {
        payload.photo_url = result.url;
        payload.photo_public_id = result.public_id;
      }
      delete payload.photo;
    }

    const data = await refuelService.update(Number(req.params.id), payload, req.user.sub);
    res.status(200).json({ success: true, data });
  }),

  approve: asyncHandler(async (req, res) => {
    const approved = req.body.approved !== false;
    const data = await refuelService.approve(Number(req.params.id), req.user.sub, approved);
    res.status(200).json({ success: true, data });
  }),

  remove: asyncHandler(async (req, res) => {
    // Clean up photo if it exists
    const existing = await refuelService.getById(Number(req.params.id));
    if (existing?.photo_public_id) {
      await deleteImage(existing.photo_public_id);
    }
    await refuelService.remove(Number(req.params.id));
    res.status(200).json({ success: true, message: 'Refuel log deleted' });
  })
};
