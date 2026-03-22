import { SavedReportFilter } from '../models/savedReportFilterModel.js';

export const listSavedFilters = () => SavedReportFilter.find().sort({ createdAt: -1 }).lean();

export const saveFilter = async (filter) => {
  const doc = await SavedReportFilter.create(filter);
  return doc.toObject();
};

