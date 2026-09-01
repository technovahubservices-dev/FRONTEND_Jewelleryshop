import * as XLSX from 'xlsx';

export const exportToExcel = ({ data, columns, sheetName, filename }) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  if (columns) {
    worksheet['!cols'] = columns
  }
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}
