import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  }

  try {
    const { file_name, data: excelData } = JSON.parse(event.body);

    if (!file_name || !excelData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing file_name or data' })
      };
    }

    const now = new Date();
    const store = getStore("dashboard_store");
    
    const payload = {
      file_name,
      data: excelData,
      updated_at: now.toISOString()
    };

    await store.set("latest_report", JSON.stringify(payload));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: payload })
    };
  } catch (error) {
    console.error('Error writing to Netlify Blobs:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
