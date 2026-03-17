import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';

const READONLY_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
let sheetsClient: sheets_v4.Sheets | null = null;

export type GoogleSheetsConfig = {
  spreadsheetId: string;
  tabName: string;
  range: string;
};

const parseInlineServiceAccount = (): Record<string, unknown> | undefined => {
  const rawServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawServiceAccount) {
    return undefined;
  }

  try {
    return JSON.parse(rawServiceAccount) as Record<string, unknown>;
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY must be valid JSON');
  }
};

const getSheetsClient = (): sheets_v4.Sheets => {
  if (sheetsClient) {
    return sheetsClient;
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: parseInlineServiceAccount(),
    scopes: [READONLY_SCOPE],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
};

export const getGoogleSheetsConfig = (): GoogleSheetsConfig => {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is required');
  }

  return {
    spreadsheetId,
    tabName: process.env.GOOGLE_SHEETS_TAB_NAME ?? 'Content',
    range: process.env.GOOGLE_SHEETS_RANGE ?? 'A1:Z',
  };
};

export const fetchSheetValues = async (): Promise<string[][]> => {
  const { spreadsheetId, tabName, range } = getGoogleSheetsConfig();
  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!${range}`,
    majorDimension: 'ROWS',
    valueRenderOption: 'FORMATTED_VALUE',
  });

  return (response.data.values ?? []).map((row) => row.map((cell) => String(cell ?? '')));
};
