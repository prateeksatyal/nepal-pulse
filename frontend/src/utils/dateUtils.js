export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getWarrantyStatus(endDateString) {
  if (!endDateString) return { status: 'No Warranty', color: 'gray', days: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDateString);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return { status: 'Expired', color: 'red', days };
  } else if (days <= 30) {
    return { status: 'Expiring Soon', color: 'amber', days };
  } else {
    return { status: 'Active', color: 'green', days };
  }
}
