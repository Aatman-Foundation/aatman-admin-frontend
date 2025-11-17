export const formatDate = (value, options = {}) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    ...options
  }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

export const formatPhone = (value) => {
  if (!value) return '—';
  return value.replace(/(\+91)(\d{2})(\d{3})(\d{4})/, '$1 $2-$3-$4');
};

export const formatStatus = (status) => {
  if (!status) return '—';
  return status
    .toString()
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
};

export const formatCount = (value) => new Intl.NumberFormat('en-IN').format(value ?? 0);

export const formatAddress = (address) => {
  if (!address) return '—';
  const { houseNo, street, city, state, pinCode } = address;
  return [houseNo, street, city, state, pinCode].filter(Boolean).join(', ');
};
