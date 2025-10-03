// DiagnosticSuggestions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting possible underlying conditions
 * based on the ABG interpretation.
 *
 * - suggestPossibleConditions - A function that suggests possible underlying conditions based on the ABG interpretation.
 * - SuggestPossibleConditionsInput - The input type for the suggestPossibleConditions function.
 * - SuggestPossibleConditionsOutput - The return type for the suggestPossibleConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPossibleConditionsInputSchema = z.object({
  abgInterpretation: z
    .string()
    .describe('The interpretation of the ABG results.'),
});
export type SuggestPossibleConditionsInput = z.infer<
  typeof SuggestPossibleConditionsInputSchema
>;

const SuggestPossibleConditionsOutputSchema = z.object({
  possibleConditions: z
    .string()
    .describe(
      'A list of possible underlying medical conditions that could explain the ABG interpretation.'
    ),
});
export type SuggestPossibleConditionsOutput = z.infer<
  typeof SuggestPossibleConditionsOutputSchema
>;

export async function suggestPossibleConditions(
  input: SuggestPossibleConditionsInput
): Promise<SuggestPossibleConditionsOutput> {
  return suggestPossibleConditionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPossibleConditionsPrompt',
  input: {schema: SuggestPossibleConditionsInputSchema},
  output: {schema: SuggestPossibleConditionsOutputSchema},
  prompt: `Based on the following ABG interpretation: {{{abgInterpretation}}}, suggest possible underlying medical conditions that could explain these results. Provide a concise list.
`,
});

const suggestPossibleConditionsFlow = ai.defineFlow(
  {
    name: 'suggestPossibleConditionsFlow',
    inputSchema: SuggestPossibleConditionsInputSchema,
    outputSchema: SuggestPossibleConditionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
