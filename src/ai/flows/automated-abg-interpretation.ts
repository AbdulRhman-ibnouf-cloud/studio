'use server';
/**
 * @fileOverview Provides an initial automated interpretation of ABG results.
 *
 * - automatedAbgInterpretation - A function that handles the ABG interpretation process.
 * - AutomatedAbgInterpretationInput - The input type for the automatedAbgInterpretation function.
 * - AutomatedAbgInterpretationOutput - The return type for the automatedAbgInterpretation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedAbgInterpretationInputSchema = z.object({
  pH: z.number().describe('The pH value of the blood sample.'),
  pCO2: z.number().describe('The partial pressure of carbon dioxide in the blood (pCO2).'),
  HCO3: z.number().describe('The bicarbonate concentration in the blood (HCO3).'),
  PaO2: z.number().describe('The partial pressure of oxygen in the blood (PaO2).'),
  BE: z.number().describe('The base excess (BE) value of the blood sample.'),
});

export type AutomatedAbgInterpretationInput = z.infer<typeof AutomatedAbgInterpretationInputSchema>;

const AutomatedAbgInterpretationOutputSchema = z.object({
  interpretation: z.string().describe('An initial interpretation of the ABG results.'),
});

export type AutomatedAbgInterpretationOutput = z.infer<typeof AutomatedAbgInterpretationOutputSchema>;

export async function automatedAbgInterpretation(input: AutomatedAbgInterpretationInput): Promise<AutomatedAbgInterpretationOutput> {
  return automatedAbgInterpretationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedAbgInterpretationPrompt',
  input: {schema: AutomatedAbgInterpretationInputSchema},
  output: {schema: AutomatedAbgInterpretationOutputSchema},
  prompt: `You are an expert in interpreting arterial blood gas (ABG) results. Based on the provided ABG values, provide an initial interpretation of the patient's acid-base balance. Consider pH, pCO2, HCO3, PaO2 and BE in your analysis.

  pH: {{{pH}}}
  pCO2: {{{pCO2}}}
  HCO3: {{{HCO3}}}
  PaO2: {{{PaO2}}}
  BE: {{{BE}}}
  `,
});

const automatedAbgInterpretationFlow = ai.defineFlow(
  {
    name: 'automatedAbgInterpretationFlow',
    inputSchema: AutomatedAbgInterpretationInputSchema,
    outputSchema: AutomatedAbgInterpretationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
