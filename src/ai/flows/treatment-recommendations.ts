// src/ai/flows/treatment-recommendations.ts
'use server';

/**
 * @fileOverview A treatment recommendation AI agent.
 *
 * - treatmentRecommendations - A function that handles the treatment recommendations process.
 * - TreatmentRecommendationsInput - The input type for the treatmentRecommendations function.
 * - TreatmentRecommendationsOutput - The return type for the treatmentRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TreatmentRecommendationsInputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis of the patient based on ABG analysis.'),
  possibleConditions: z.string().describe('Possible underlying conditions identified.'),
});
export type TreatmentRecommendationsInput = z.infer<typeof TreatmentRecommendationsInputSchema>;

const TreatmentRecommendationsOutputSchema = z.object({
  treatmentRecommendations: z
    .string()
    .describe('Suggested initial steps or potential treatments for the identified conditions.'),
});
export type TreatmentRecommendationsOutput = z.infer<typeof TreatmentRecommendationsOutputSchema>;

export async function treatmentRecommendations(input: TreatmentRecommendationsInput): Promise<TreatmentRecommendationsOutput> {
  return treatmentRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'treatmentRecommendationsPrompt',
  input: {schema: TreatmentRecommendationsInputSchema},
  output: {schema: TreatmentRecommendationsOutputSchema},
  prompt: `You are an experienced medical doctor giving treatment recommendations.

  Based on the diagnosis and possible underlying conditions, suggest initial steps or potential treatments.

  Diagnosis: {{{diagnosis}}}
  Possible Conditions: {{{possibleConditions}}}

  Provide treatment recommendations:
  `,
});

const treatmentRecommendationsFlow = ai.defineFlow(
  {
    name: 'treatmentRecommendationsFlow',
    inputSchema: TreatmentRecommendationsInputSchema,
    outputSchema: TreatmentRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
