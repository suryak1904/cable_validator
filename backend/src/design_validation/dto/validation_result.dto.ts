import { FieldValidationDto } from './field_validation.dto';

export class ValidationResultDto {
  overallStatus: 'PASS' | 'FAIL' | 'WARN';
  fields: FieldValidationDto[];
  mergedInput: Record<string, any>;
  calculated: {
    conductorDiameter?: number;
    insulationNominal?: number;
    insulationMinAllowed?: number;
    fictitiousDiameter?: number;
    beddingThickness?: number;
    expectedSheathThickness?: number;
    expectedOuterDiameter?: number;
    outerDiameterMin?: number;
    outerDiameterMax?: number;
  };

  aiRaw: {
    fields: Record<string, any>;
    confidence: Record<string, number>;
  };
}
