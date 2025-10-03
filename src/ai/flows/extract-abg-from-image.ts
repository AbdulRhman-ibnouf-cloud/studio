'use server';
/**
 * @fileOverview Extracts ABG values from an image.
 *
 * - extractAbgFromImage - A function that handles the value extraction process.
 * - ExtractAbgFromImageInput - The input type for the function.
 * - ExtractAbgFromImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractAbgFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of an ABG report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ExtractAbgFromImageInput = z.infer<
  typeof ExtractAbgFromImageInputSchema
>;

const ExtractedValuesSchema = z.object({
    pH: z.number().optional().describe('The pH value.'),
    pCO2: z.number().optional().describe('The pCO2 value.'),
    HCO3: z.number().optional().describe('The HCO3 value.'),
    PaO2: z.number().optional().describe('The PaO2 value.'),
    BE: z.number().optional().describe('The Base Excess (BE) value.'),
});

const ExtractAbgFromImageOutputSchema = z.object({
    values: ExtractedValuesSchema.describe("The extracted ABG values from the image. If a value is not found, it should be omitted."),
});

export type ExtractAbgFromImageOutput = z.infer<
  typeof ExtractAbgFromImageOutputSchema
>;

export async function extractAbgFromImage(
  input: ExtractAbgFromImageInput
): Promise<ExtractAbgFromImageOutput> {
  return extractAbgFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAbgFromImagePrompt',
  input: { schema: ExtractAbgFromImageInputSchema },
  output: { schema: ExtractAbgFromImageOutputSchema },
  prompt: `You are a highly accurate medical document scanner. Analyze the provided image of an Arterial Blood Gas (ABG) report and extract the following values: pH, pCO2, HCO3, PaO2, and BE.
  
  - Identify each value and its corresponding number.
  - Be precise. Do not guess or hallucinate values.
  - If a specific value is not present in the image, omit it from the output.
  - Return the data in the specified JSON format.

  Image to analyze: {{media url=imageDataUri}}`,
});

const extractAbgFromImageFlow = ai.defineFlow(
  {
    name: 'extractAbgFromImageFlow',
    inputSchema: ExtractAbgFromImageInputSchema,
    outputSchema: ExtractAbgFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
