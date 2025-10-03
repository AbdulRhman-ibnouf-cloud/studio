'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/full-abg-analysis.ts';
import '@/ai/flows/extract-abg-from-image.ts';
