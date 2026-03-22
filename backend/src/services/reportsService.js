import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { reportsRepository } from '../repositories/reportsRepository.js';
import { listSavedFilters, saveFilter as saveFilterStore } from '../utils/savedReportFiltersStore.js';

const getReportData = async (query) => {
  const [costRows, slaRows] = await Promise.all([
    reportsRepository.costAnalysis(query),
    reportsRepository.slaTrend(query)
  ]);

  return { costRows, slaRows };
};

export const reportsService = {
  costAnalysis(query) {
    return reportsRepository.costAnalysis(query);
  },
  slaTrend(query) {
    return reportsRepository.slaTrend(query);
  },

  async exportExcel(query) {
    const { costRows, slaRows } = await getReportData(query);
    const workbook = new ExcelJS.Workbook();

    const costSheet = workbook.addWorksheet('Cost Analysis');
    costSheet.columns = [
      { header: 'Module', key: 'module', width: 16 },
      { header: 'Date', key: 'txDate', width: 16 },
      { header: 'Vehicle ID', key: 'vehicle_id', width: 12 },
      { header: 'Amount', key: 'amount', width: 14 }
    ];
    costRows.forEach((row) => costSheet.addRow(row));

    const slaSheet = workbook.addWorksheet('SLA Trend');
    slaSheet.columns = [
      { header: 'Period', key: 'period', width: 16 },
      { header: 'Completed', key: 'completed', width: 12 },
      { header: 'Breached', key: 'breached', width: 12 },
      { header: 'Total', key: 'total', width: 12 }
    ];
    slaRows.forEach((row) => slaSheet.addRow(row));

    return workbook.xlsx.writeBuffer();
  },

  async exportPdf(query) {
    const { costRows, slaRows } = await getReportData(query);

    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(16).text('Operations Report', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text('Cost Analysis');
      costRows.slice(0, 25).forEach((row) => {
        doc.fontSize(10).text(`${row.txDate} | ${row.module} | vehicle ${row.vehicle_id ?? '-'} | amount ${row.amount}`);
      });

      doc.moveDown();
      doc.fontSize(12).text('SLA Trend');
      slaRows.slice(0, 25).forEach((row) => {
        doc.fontSize(10).text(`${row.period} | total ${row.total} | completed ${row.completed} | breached ${row.breached}`);
      });

      doc.end();
    });
  },

  listSavedFilters() {
    return listSavedFilters();
  },

  saveFilter(payload) {
    return saveFilterStore(payload);
  }
};
