import { getStore } from "@netlify/blobs";

export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const store = getStore("dashboard_store");
    const latestData = await store.get("latest_report", { type: "json" });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: latestData || null })
    };
  } catch (error) {
    console.error('Error reading from Netlify Blobs:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
