/**
 * Vercel Serverless Function: GET /api
 * 
 * Root API endpoint - health check and info
 * 
 * @param request - Vercel request object
 * @returns HTML response with API info
 */

import { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders, handleCorsPreflight } from "../lib/api-utils.js";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Handle CORS preflight
  if (handleCorsPreflight(request, response)) {
    return;
  }

  setCorsHeaders(response);

  // Only allow GET method
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const html = `
    <h2>Recipe App Backend is running! 🚀</h2>
    <p>Visit <a href="https://github.com/arnobt78/Recipe-Web-App--React-FullStack" target="_blank">GitHub Repo</a> for documentation.</p>
    <h3>Available Endpoints:</h3>
    <ul>
      <li>GET /api/recipes/search?searchTerm=&lt;term&gt;&amp;page=&lt;page&gt;</li>
      <li>GET /api/recipes/[recipeId]/summary</li>
      <li>POST /api/recipes/favourite</li>
      <li>GET /api/recipes/favourite</li>
      <li>DELETE /api/recipes/favourite</li>
    </ul>
  `;

  response.setHeader("Content-Type", "text/html");
  return response.status(200).send(html);
}

