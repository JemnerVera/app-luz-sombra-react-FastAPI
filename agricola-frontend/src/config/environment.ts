// Environment configuration
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:10000'),
  googleSheetsConfig: process.env.REACT_APP_GOOGLE_SHEETS_CONFIG || '',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
