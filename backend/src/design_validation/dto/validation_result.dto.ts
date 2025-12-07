// src/design_validation/dto/validation_result.dto.ts
import { FieldValidationDto } from './field_validation.dto';

export class ValidationResultDto {
  overallStatus: 'PASS' | 'FAIL' | 'WARN';
  fields: FieldValidationDto[];

  // All inputs after merge (structured + AI)
  mergedInput: Record<string, any>;

  // Values computed during validation
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

  // Raw AI payload 
  aiRaw: {
    fields: Record<string, any>;
    confidence: Record<string, number>;
  };
}
