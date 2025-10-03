"use server";

import { z } from "zod";
import { automatedAbgInterpretation } from "@/ai/flows/automated-abg-interpretation";
import { suggestPossibleConditions } from "@/ai/flows/diagnostic-suggestions";
import { treatmentRecommendations } from "@/ai/flows/treatment-recommendations";

export const AbgFormSchema = z.object({
  pH: z.coerce.number().min(6.8, "pH must be ≥ 6.8").max(7.8, "pH must be ≤ 7.8"),
  pCO2: z.coerce
    .number()
    .min(10, "pCO2 must be ≥ 10")
    .max(150, "pCO2 must be ≤ 150"),
  HCO3: z.coerce
    .number()
    .min(5, "HCO3 must be ≥ 5")
    .max(60, "HCO3 must be ≤ 60"),
  PaO2: z.coerce
    .number()
    .min(20, "PaO2 must be ≥ 20")
    .max(500, "PaO2 must be ≤ 500"),
  BE: z.coerce.number().min(-30, "BE must be ≥ -30").max(30, "BE must be ≤ 30"),
});

export type AbgFormState =
  | {
      interpretation: string;
      possibleConditions: string;
      treatmentRecommendations: string;
    }
  | {
      error: string;
    };

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
