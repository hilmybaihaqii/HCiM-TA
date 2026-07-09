'use server';

import { Client } from "@gradio/client";

export async function analyzeBiomarkers(inputs: number[]) {
  try {
    const spaceId = process.env.MODEL_SPACE_ID;
    if (!spaceId) throw new Error("Model Space ID is not configured.");

    const app = await Client.connect(spaceId);

    const [predResult, shapResult] = await Promise.all([
      app.predict("/predict", inputs),
      app.predict("/explain", inputs)
    ]);

    // Beri tahu TypeScript bentuk datanya secara eksplisit
    const predData = predResult.data as unknown as any[];
    const shapDataRaw = shapResult.data as unknown as any[];

    const tier = predData[1] as string;
    const shapData = shapDataRaw[0] as {
      predicted_class: string;
      base_value: number;
      contributions: { biomarker: string; value: number; shap: number }[];
    };

    return { success: true, tier, shapData };
  } catch (error) {
    console.error("Model Prediction Error:", error);
    return { success: false, error: "Failed to process data through the computation engine." };
  }
}