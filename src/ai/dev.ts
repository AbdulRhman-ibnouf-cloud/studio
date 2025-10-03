import { config } from 'dotenv';
config();

import '@/ai/flows/diagnostic-suggestions.ts';
import '@/ai/flows/automated-abg-interpretation.ts';
import '@/ai/flows/treatment-recommendations.ts';