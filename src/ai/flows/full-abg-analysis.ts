'use server';
/**
 * @fileOverview A comprehensive ABG analysis flow that provides interpretation,
 * suggests possible conditions, and offers treatment recommendations in a single call.
 *
 * - fullAbgAnalysis - A function that handles the complete ABG analysis process.
 * - FullAbgAnalysisInput - The input type for the fullAbgAnalysis function.
 * - FullAbgAnalysisOutput - The return type for the fullAbgAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FullAbgAnalysisInputSchema = z.object({
  pH: z.number().describe('The pH value of the blood sample.'),
  pCO2: z.number().describe('The partial pressure of carbon dioxide in the blood (pCO2).'),
  HCO3: z.number().describe('The bicarbonate concentration in the blood (HCO3).'),
  PaO2: z.number().describe('The partial pressure of oxygen in the blood (PaO2).'),
  BE: z.number().describe('The base excess (BE) value of the blood sample.'),
});

export type FullAbgAnalysisInput = z.infer<typeof FullAbgAnalysisInputSchema>;

const FullAbgAnalysisOutputSchema = z.object({
  interpretation: z.string().describe('An initial interpretation of the ABG results based on the provided values.'),
  possibleConditions: z.string().describe('A list of possible underlying medical conditions that could explain the ABG interpretation.'),
  treatmentRecommendations: z.string().describe("Suggested initial steps or potential treatments for the identified conditions, formatted as a Markdown bulleted list. Each recommendation should be a separate bullet point (e.g., '- Recommendation 1\\n- Recommendation 2')."),
});

export type FullAbgAnalysisOutput = z.infer<typeof FullAbgAnalysisOutputSchema>;

export async function fullAbgAnalysis(input: FullAbgAnalysisInput): Promise<FullAbgAnalysisOutput> {
  return fullAbgAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fullAbgAnalysisPrompt',
  input: {schema: FullAbgAnalysisInputSchema},
  output: {schema: FullAbgAnalysisOutputSchema},
  prompt: `You are an expert in interpreting arterial blood gas (ABG) results. Based on the provided ABG values, perform a complete analysis.
  
  ABG Values:
  - pH: {{{pH}}}
  - pCO2: {{{pCO2}}}
  - HCO3: {{{HCO3}}}
  - PaO2: {{{PaO2}}}
  - BE: {{{BE}}}

  Your tasks are:
  1.  **Interpretation**: Provide a concise interpretation of the patient's acid-base balance.
  2.  **Possible Conditions**: Suggest a list of possible underlying medical conditions that could explain these results.
  3.  **Treatment Recommendations**: Based on the interpretation and possible conditions, suggest initial steps or potential treatments. Format these recommendations as a Markdown bulleted list.

  Return the response in the specified JSON format with the fields: 'interpretation', 'possibleConditions', and 'treatmentRecommendations'.
  `,
});

const fullAbgAnalysisFlow = ai.defineFlow(
  {
    name: 'fullAbgAnalysisFlow',
    inputSchema: FullAbgAnalysisInputSchema,
    outputSchema: FullAbgAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
