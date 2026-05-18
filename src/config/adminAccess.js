const ALLOWED_ADMIN_EMAILS = ['vipulkumar.quant@gmail.com'];

export const isAllowedAdminEmail = (email) => {
  if (!email) return false;

  return ALLOWED_ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
};

export default ALLOWED_ADMIN_EMAILS;
