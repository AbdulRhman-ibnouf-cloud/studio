import { z } from "zod";

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
