"use server";

import { z } from "zod";
import { AbgFormSchema, type AbgFormState } from "@/app/schema";
import { fullAbgAnalysis } from "@/ai/flows/full-abg-analysis";
import { extractAbgFromImage } from "@/ai/flows/extract-abg-from-image";
import { textToSpeech } from "@/ai/flows/text-to-speech";

export async function analyzeAbg(
  values: z.infer<typeof AbgFormSchema>
): Promise<AbgFormState> {
  const validatedFields = AbgFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid input. Please check the values and try again.",
    };
  }

  try {
    const analysisResult = await fullAbgAnalysis(validatedFields.data);

    if (!analysisResult?.interpretation || !analysisResult?.possibleConditions || !analysisResult?.treatmentRecommendations) {
       throw new Error("The AI model returned an incomplete analysis. Please try again.");
    }

    return {
      interpretation: analysisResult.interpretation,
      possibleConditions: analysisResult.possibleConditions,
      treatmentRecommendations: analysisResult.treatmentRecommendations,
    };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error
        ? e.message
        : "An unknown error occurred during analysis.";
    return {
      error: `Sorry, we couldn't complete the analysis. ${errorMessage}`,
    };
  }
}

export async function getAudioForText(text: string): Promise<{ audioDataUri?: string; error?: string; }> {
  if (!text) {
    return { error: "No text provided to read." };
  }

  try {
    const result = await textToSpeech({ text });
    return { audioDataUri: result.audioDataUri };
  } catch (e) {
    console.error("Text-to-speech failed:", e);
    const errorMessage =
      e instanceof Error
        ? e.message
        : "An unknown error occurred during audio generation.";
    return { error: `Could not generate audio. ${errorMessage}` };
  }
}
