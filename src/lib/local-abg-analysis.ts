
import type { z } from 'zod';
import type { AbgFormSchema } from '@/app/schema';

type AbgValues = z.infer<typeof AbgFormSchema>;

export function localAbgAnalysis(values: AbgValues): { interpretation: string } {
  const { pH, pCO2, HCO3 } = values;

  // Normal ranges
  const pH_NORMAL = [7.35, 7.45];
  const PCO2_NORMAL = [35, 45]; // mmHg
  const HCO3_NORMAL = [22, 26]; // mEq/L

  let acidBaseStatus: 'Acidosis' | 'Alkalosis' | 'Normal' = 'Normal';
  if (pH < pH_NORMAL[0]) {
    acidBaseStatus = 'Acidosis';
  } else if (pH > pH_NORMAL[1]) {
    acidBaseStatus = 'Alkalosis';
  }

  let cause: 'Respiratory' | 'Metabolic' | 'Mixed' | 'Normal' = 'Normal';
  
  const isPco2High = pCO2 > PCO2_NORMAL[1];
  const isPco2Low = pCO2 < PCO2_NORMAL[0];
  const isHco3High = HCO3 > HCO3_NORMAL[1];
  const isHco3Low = HCO3 < HCO3_NORMAL[0];

  if (acidBaseStatus === 'Acidosis') {
    if (isPco2High && isHco3Low) {
      cause = 'Mixed';
      return { interpretation: 'Mixed Acidosis (Respiratory and Metabolic).' };
    }
    if (isPco2High) {
      cause = 'Respiratory';
    } else if (isHco3Low) {
      cause = 'Metabolic';
    }
  } else if (acidBaseStatus === 'Alkalosis') {
    if (isPco2Low && isHco3High) {
        cause = 'Mixed';
        return { interpretation: 'Mixed Alkalosis (Respiratory and Metabolic).' };
    }
    if (isPco2Low) {
      cause = 'Respiratory';
    } else if (isHco3High) {
      cause = 'Metabolic';
    }
  }

  if (cause === 'Normal' && acidBaseStatus === 'Normal') {
    return { interpretation: 'Normal acid-base balance.' };
  }

  // Check for compensation
  let compensationStatus = '';

  if (cause === 'Respiratory' && acidBaseStatus === 'Acidosis') { // Respiratory Acidosis
    if (isHco3High) compensationStatus = 'with partial metabolic compensation';
    if (pH >= pH_NORMAL[0] && pH <= pH_NORMAL[1] && isHco3High) compensationStatus = 'with full metabolic compensation';
  } else if (cause === 'Metabolic' && acidBaseStatus === 'Acidosis') { // Metabolic Acidosis
    if (isPco2Low) compensationStatus = 'with partial respiratory compensation';
    if (pH >= pH_NORMAL[0] && pH <= pH_NORMAL[1] && isPco2Low) compensationStatus = 'with full respiratory compensation';
  } else if (cause === 'Respiratory' && acidBaseStatus === 'Alkalosis') { // Respiratory Alkalosis
    if (isHco3Low) compensationStatus = 'with partial metabolic compensation';
    if (pH >= pH_NORMAL[0] && pH <= pH_NORMAL[1] && isHco3Low) compensationStatus = 'with full metabolic compensation';
  } else if (cause === 'Metabolic' && acidBaseStatus === 'Alkalosis') { // Metabolic Alkalosis
    if (isPco2High) compensationStatus = 'with partial respiratory compensation';
    if (pH >= pH_NORMAL[0] && pH <= pH_NORMAL[1] && isPco2High) compensationStatus = 'with full respiratory compensation';
  }

  let interpretation = `${cause} ${acidBaseStatus}`;
  if (compensationStatus) {
    interpretation += ` ${compensationStatus}`;
  }
  
  if (cause === 'Normal' && acidBaseStatus !== 'Normal') {
      interpretation = `Primary ${acidBaseStatus} of unclear origin based on provided values.`
  }

  return { interpretation: interpretation.trim() + '.' };
}
