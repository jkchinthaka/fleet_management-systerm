import { asyncHandler } from '../utils/asyncHandler.js';
import { reportsService } from '../services/reportsService.js';

export const reportsController = {
  costAnalysis: asyncHandler(async (req, res) => {
    const data = await reportsService.costAnalysis(req.query);
    res.status(200).json({ success: true, data });
  }),
  slaTrend: asyncHandler(async (req, res) => {
    const data = await reportsService.slaTrend(req.query);
    res.status(200).json({ success: true, data });
  }),
  exportExcel: asyncHandler(async (req, res) => {
    const file = await reportsService.exportExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="operations-report.xlsx"');
    res.send(file);
  }),
  exportPdf: asyncHandler(async (req, res) => {
    const file = await reportsService.exportPdf(req.query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="operations-report.pdf"');
    res.send(file);
  }),
  listSavedFilters: asyncHandler(async (_req, res) => {
    const data = await reportsService.listSavedFilters();
    res.status(200).json({ success: true, data });
  }),
  saveFilter: asyncHandler(async (req, res) => {
    const data = await reportsService.saveFilter(req.body);
    res.status(201).json({ success: true, data });
  })
};
