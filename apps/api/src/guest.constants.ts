export const GUEST_PERMISSIONS = {
  PROFILE: ['VIEW', 'CREATE', 'UPDATE', 'DEACTIVATE'],
  CONTACT: ['VIEW', 'VIEW_FULL', 'UPDATE'],
  IDENTITY: ['VIEW', 'VIEW_FULL', 'CREATE', 'UPDATE'],
  PREFERENCE: ['VIEW', 'UPDATE'],
  NOTE: ['VIEW', 'CREATE', 'UPDATE', 'MANAGEMENT'],
  VIP: ['VIEW', 'MANAGE'],
  REPORT: ['VIEW', 'EXPORT'], AUDIT: ['VIEW'], CONFIG: ['MANAGE'],
};
export const GUEST_DEFAULTS = {
  guestType: ['Individual', 'Corporate Guest', 'Travel Agent Guest', 'Group Guest', 'Walk-In', 'Member', 'VIP', 'Staff / Internal', 'Other'],
  identityType: ['Myanmar NRC', 'Passport', 'National ID', 'Driving Licence', 'Other Government ID'],
  vipLevel: ['VIP 1', 'VIP 2', 'VIP 3', 'VVIP'],
  preferenceType: ['Room Type', 'Bed Type', 'Smoking', 'Floor', 'Quiet Room', 'Pillow', 'Language', 'Other'],
};
