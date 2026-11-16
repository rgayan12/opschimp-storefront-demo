import type { Context } from "@netlify/edge-functions";

export default async (request: Request, _context: Context) => {
  // CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Demo-Api-Key, X-Demo-Base-Url",
      },
    });
  }

  // 1. Resolve target OpsChimp URL & Secret Key
  const envBaseUrl = Netlify.env.get("OPSCHIMP_BASE_URL") || "https://app.opschimp.com/api/v1/client";
  const envApiKey = Netlify.env.get("OPSCHIMP_API_KEY") || "";

  const headerBaseUrl = request.headers.get("x-demo-base-url");
  const headerApiKey = request.headers.get("x-demo-api-key");

  const targetBaseUrl = (headerBaseUrl && headerBaseUrl.trim()) ? headerBaseUrl.trim() : envBaseUrl;
  const token = (headerApiKey && headerApiKey.trim()) ? headerApiKey.trim() : envApiKey;

  // 2. Map incoming URL (/api/leads/... -> targetBaseUrl/leads/...)
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, "");
  const targetFullUrl = `${targetBaseUrl.replace(/\/+$/, "")}${path}${url.search}`;

  // 3. Prepare headers
  const forwardHeaders = new Headers();
  forwardHeaders.set("Accept", "application/json");
  
  const contentType = request.headers.get("content-type");
  if (contentType) {
    forwardHeaders.set("Content-Type", contentType);
  }

  if (token) {
    forwardHeaders.set("Authorization", `Bearer ${token}`);
  }

  // Forward Cloudflare client IP if available
  const clientIp = request.headers.get("x-nf-client-connection-ip") || request.headers.get("client-ip");
  if (clientIp) {
    forwardHeaders.set("X-Forwarded-For", clientIp);
  }

  try {
    const response = await fetch(targetFullUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
    });

    const responseBody = await response.text();
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to reach OpsChimp Client API from Edge Function.",
        detail: error?.message || String(error),
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};
