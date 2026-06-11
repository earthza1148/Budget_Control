export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Headers for API calls
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Get Latest Excel Data
    if (url.pathname === "/api/get-data") {
      try {
        if (!env.DASHBOARD_KV) {
          return new Response(JSON.stringify({ success: false, error: "Cloudflare KV Binding (DASHBOARD_KV) is not configured." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        const data = await env.DASHBOARD_KV.get("latest_report");
        return new Response(JSON.stringify({ success: true, data: data ? JSON.parse(data) : null }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2. Upload/Save Excel Data
    if (url.pathname === "/api/upload-data" && request.method === "POST") {
      try {
        if (!env.DASHBOARD_KV) {
          return new Response(JSON.stringify({ success: false, error: "Cloudflare KV Binding (DASHBOARD_KV) is not configured." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const body = await request.json();
        const payload = {
          file_name: body.file_name,
          data: body.data,
          updated_at: new Date().toISOString(),
        };

        await env.DASHBOARD_KV.put("latest_report", JSON.stringify(payload));

        return new Response(JSON.stringify({ success: true, data: payload }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3. Serve Static Assets (index.html, etc.)
    return env.ASSETS.fetch(request);
  },
};
