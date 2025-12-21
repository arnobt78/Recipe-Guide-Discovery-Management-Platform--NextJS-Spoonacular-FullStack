/**
 * Image Upload API Endpoint
 *
 * Handles image uploads to Cloudinary
 * POST: Upload image and return URL
 */

import "dotenv/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders, handleCorsPreflight, requireAuth } from "../../lib/api-utils.js";
import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (handleCorsPreflight(request, response)) {
    return;
  }

  setCorsHeaders(response);

  try {
    const userId = await requireAuth(request, response);
    if (!userId) {
      return; // Response already sent by requireAuth
    }

    // POST: Upload image
    if (request.method === "POST") {
      const { imageData, folder } = request.body;

      if (!imageData) {
        return response.status(400).json({ error: "Image data is required" });
      }

      // Upload to Cloudinary using SDK
      const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
      const uploadOptions: {
        folder?: string;
        [key: string]: unknown;
      } = {
        folder: folder || `recipe-app/${userId}`,
      };

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Data}`,
        uploadOptions
      );

      return response.status(200).json({
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
      });
    }

    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error handling image upload request:", error);
    return response.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

