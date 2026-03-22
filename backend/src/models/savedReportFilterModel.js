import mongoose from 'mongoose';

const savedReportFilterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    reportType: { type: String },
    filters: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const SavedReportFilter = mongoose.model('SavedReportFilter', savedReportFilterSchema, 'saved_report_filters');
