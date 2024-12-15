
//Quite a messy main code for the webapp, using my university course works as template and taking code snippets here and there and making it work

import { serve } from "https://deno.land/std@0.199.0/http/server.ts";

// Serve static files
async function serveStaticFile(path, contentType) {
    try {
        const data = await Deno.readFile(path);
        return new Response(data, {
            headers: { "Content-Type": contentType },
        });
    } catch {
        return new Response("File not found", { status: 404 });
    }
}

// Handle incoming requests
async function handler(req) {
    const url = new URL(req.url);

    // Route: Serve static files
    if (url.pathname.startsWith("/static/")) {
        const filePath = `.${url.pathname}`;
        const contentType = getContentType(filePath);
        return await serveStaticFile(filePath, contentType);
    }


// Route: Index page
if (url.pathname === "/" && req.method === "GET") {
    const response = await serveStaticFile('./views/index.html', 'text/html');
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self'; connect-src 'self' http://127.0.0.1:5000 https://api.edenai.run");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
}

// Route: Weather page
if (url.pathname === "/weather" && req.method === "GET") {
    const response = await serveStaticFile('./views/weather.html', 'text/html');
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self'; connect-src 'self' http://127.0.0.1:5000 https://api.edenai.run");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
}

return new Response("Not Found", { status: 404 });
}

// Utility: Get content type for static files
function getContentType(filePath) {
    const ext = filePath.split(".").pop();
    const mimeTypes = {
        html: "text/html",
        css: "text/css",
        js: "application/javascript",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        json: "application/json",
    };
    return mimeTypes[ext] || "application/octet-stream";
}

// Start the server
serve(handler, { port: 8000 });
//serve(handler, { port: 80, hostname: "0.0.0.0" });

// Run: deno run --allow-net --allow-env --allow-read --watch app.js
