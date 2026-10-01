/**
 * Feature 4: Automatic Warranty Status Service
 * Calculates status based on end_date:
 * - Active: More than 30 days remaining
 * - Expiring Soon: 0–30 days remaining
 * - Expired: Past the expiry date (< 0 days remaining)
 */

function calculateWarrantyStatus(endDateInput) {
  if (!endDateInput) {
    return {
      status: 'No Warranty',
      daysRemaining: null,
      badgeColor: 'gray',
      isExpired: false,
      isExpiringSoon: false,
      isActive: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateInput);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = 'Active';
  let badgeColor = 'green';
  let isExpired = false;
  let isExpiringSoon = false;
  let isActive = false;

  if (daysRemaining < 0) {
    status = 'Expired';
    badgeColor = 'red';
    isExpired = true;
  } else if (daysRemaining <= 30) {
    status = 'Expiring Soon';
    badgeColor = 'amber';
    isExpiringSoon = true;
  } else {
    status = 'Active';
    badgeColor = 'green';
    isActive = true;
  }

  return {
    status,
    daysRemaining,
    badgeColor,
    isExpired,
    isExpiringSoon,
    isActive,
    formattedEndDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Attaches calculated status fields to a warranty record or product record
 */
function enrichWarrantyRecord(record) {
  if (!record) return record;
  const statusInfo = calculateWarrantyStatus(record.end_date);
  return {
    ...record,
    status: statusInfo.status,
    days_remaining: statusInfo.daysRemaining,
    badge_color: statusInfo.badgeColor,
    is_expired: statusInfo.isExpired,
    is_expiring_soon: statusInfo.isExpiringSoon,
    is_active: statusInfo.isActive,
  };
}

module.exports = {
  calculateWarrantyStatus,
  enrichWarrantyRecord,
};
