import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { image } = await request.json();

  // Get the API key and Model ID from environment variables
  const apiKey = process.env.ROBOFLOW_API_KEY;
  const modelId = process.env.ROBOFLOW_MODEL_ID;

  if (!apiKey || !modelId) {
    return NextResponse.json(
      { error: "Server configuration error. API key or Model ID is missing." },
      { status: 500 }
    );
  }

  try {
    // Send the image to Roboflow
    const response = await fetch(
      `https://detect.roboflow.com/${modelId}?api_key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: image.split(",")[1],  // ← FIXED: Send raw base64, not JSON
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Roboflow error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image.", details: error.message },
      { status: 500 }
    );
  }
}