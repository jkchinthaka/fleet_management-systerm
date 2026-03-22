import { vehicleDocumentService } from '../services/vehicleDocumentService.js';

export const vehicleDocumentController = {
  async list(req, res, next) {
    try {
      const docs = await vehicleDocumentService.listByVehicle(req.params.vehicleId);
      res.json({ success: true, data: docs });
    } catch (err) { next(err); }
  },
  async getById(req, res, next) {
    try {
      const doc = await vehicleDocumentService.getById(req.params.id);
      res.json({ success: true, data: doc });
    } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try {
      const doc = await vehicleDocumentService.create(req.params.vehicleId, req.body);
      res.status(201).json({ success: true, data: doc });
    } catch (err) { next(err); }
  },
  async update(req, res, next) {
    try {
      const doc = await vehicleDocumentService.update(req.params.id, req.body);
      res.json({ success: true, data: doc });
    } catch (err) { next(err); }
  },
  async remove(req, res, next) {
    try {
      await vehicleDocumentService.remove(req.params.id);
      res.json({ success: true, message: 'Vehicle document deleted' });
    } catch (err) { next(err); }
  }
};
