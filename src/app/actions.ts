"use server";

import { z } from "zod";
import { automatedAbgInterpretation } from "@/ai/flows/automated-abg-interpretation";
import { suggestPossibleConditions } from "@/ai/flows/diagnostic-suggestions";
import { treatmentRecommendations } from "@/ai/flows/treatment-recommendations";
import { AbgFormSchema, type AbgFormState } from "@/app/schema";


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
    const { pH, pCO2, HCO3, PaO2, BE } = validatedFields.data;

    // 1. Automated Analysis
    const interpretationResult = await automatedAbgInterpretation({
      pH,
      pCO2,
      HCO3,
      PaO2,
      BE,
    });
    if (!interpretationResult?.interpretation) {
      throw new Error("Failed to get ABG interpretation from the AI model.");
    }
    const interpretation = interpretationResult.interpretation;

    // 2. Diagnostic Suggestions
    const conditionsResult = await suggestPossibleConditions({
      abgInterpretation: interpretation,
    });
    if (!conditionsResult?.possibleConditions) {
      throw new Error(
        "Failed to get diagnostic suggestions from the AI model."
      );
    }
    const possibleConditions = conditionsResult.possibleConditions;

    // 3. Treatment Recommendations
    const treatmentResult = await treatmentRecommendations({
      diagnosis: interpretation,
      possibleConditions,
    });
    if (!treatmentResult?.treatmentRecommendations) {
      throw new Error(
        "Failed to get treatment recommendations from the AI model."
      );
    }
    const treatmentRecommendationsText = treatmentResult.treatmentRecommendations;

    return {
      interpretation,
      possibleConditions,
      treatmentRecommendations: treatmentRecommendationsText,
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
