import Papa from 'papaparse';

export const exportRowsToCsv = ({ rows, columns, filename = 'export.csv' }) => {
  if (!rows?.length) return;
  const exportableColumns = columns.filter((column) => column.meta?.exportable !== false);
  const headers = exportableColumns.map((column) => column.header);
  const accessors = exportableColumns.map((column) => column.accessorKey || column.id);

  const data = rows.map((row) =>
    accessors.reduce((acc, accessor, index) => {
      const value = accessor
        ? accessor.split('.').reduce((memo, key) => (memo ? memo[key] : undefined), row)
        : row[exportableColumns[index].id];
      acc[headers[index]] = typeof value === 'object' ? JSON.stringify(value) : value ?? '';
      return acc;
    }, {})
  );

  const csv = Papa.unparse(data, { quotes: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 0);
};
