import { Injectable } from '@nestjs/common';
import { AiExtractionService } from '../ai_extraction/ai_extraction.service';
import { IecDataService } from '../iec_data/iec_data.service';
import { DesignInputDto } from './dto/design_input.dto';
import { FieldValidationDto, FieldStatus } from './dto/field_validation.dto';
import { ValidationResultDto } from './dto/validation_result.dto';

@Injectable()
export class DesignValidationService {
  constructor(
    private readonly aiExtractionService: AiExtractionService,
    private readonly iecDataService: IecDataService,
  ) {}

  private normalizeClass(cls: any): string | undefined {
    if (cls === null || cls === undefined) return undefined;

    const value = String(cls);

    const cleaned = value.replace(/[^0-9]/g, '');

    return cleaned.length > 0 ? cleaned : undefined;
    }

  private normalizeMaterial(mat: any): string | undefined {
    if (mat === null || mat === undefined) return undefined;

    const m = String(mat).toLowerCase();

    if (m.includes('cu')) return 'Cu';
    if (m.includes('al')) return 'Al';
    return String(mat);
  }

  private normalizeInsulationMaterial(mat: any): string | undefined {
  if (!mat) return undefined;

  const m = String(mat).toLowerCase();

  if (m.includes("pvc")) return "PVC";
  if (m.includes("xlpe")) return "XLPE";
  if (m.includes("pe")) return "PE";
  if (m.includes("rubber")) return "RUBBER";

  return String(mat); 
}

  private preferUser<T>(user: T | '' | null | undefined, ai: T | undefined): T | undefined {
    if (user === '' || user === null || user === undefined) return ai;
    return user as T;
  }

  private mergeInput(structured: DesignInputDto, aiFields: Record<string, any>) {
    return {
      standard: this.preferUser(structured.standard, aiFields.standard),

      voltage: this.preferUser(
        structured.voltage,
        aiFields.voltage ?? aiFields.volt ?? aiFields.voltage_grade,
      ),

      conductorMaterial: this.preferUser(
        structured.conductorMaterial,
        aiFields.conductor_material ?? aiFields.material,
      ),

      conductorClass: this.preferUser(
        structured.conductorClass,
        aiFields.conductor_class ?? aiFields.class,
      ),

      csa:
        structured.csa ??
        (aiFields.csa ? Number(String(aiFields.csa).replace(/[^\d.]/g, '')) : undefined),

      insulationMaterial: this.preferUser(
        structured.insulationMaterial,
        aiFields.insulation_material ??
          aiFields.insulation ??
          aiFields.insulation_type,
      ),

      insulationThickness:
        structured.insulationThickness ??
        (aiFields.insulation_thickness
          ? Number(String(aiFields.insulation_thickness).replace(/[^\d.]/g, ''))
          : undefined),

      sheathThickness:
        structured.sheathThickness ??
        (aiFields.sheath_thickness
          ? Number(String(aiFields.sheath_thickness).replace(/[^\d.]/g, ''))
          : undefined),

      outerDiameter:
        structured.outerDiameter ??
        (aiFields.outer_diameter
          ? Number(String(aiFields.outer_diameter).replace(/[^\d.]/g, ''))
          : undefined),
    };
  }

  private buildFieldResult(
    field: string,
    status: FieldStatus,
    provided: any,
    expected: any,
    comment: string,
  ): FieldValidationDto {
    return { field, status, provided, expected, comment };
  }

 //validation main method
  async validateDesign(input: DesignInputDto): Promise<ValidationResultDto> {
    let aiExtract = { fields: {}, confidence: {} };
    if (input.freeText) {
      const aiRes = await this.aiExtractionService.extractFields(input.freeText);
      aiExtract = {
        fields: aiRes.fields ?? {},
        confidence: aiRes.confidence ?? {},
      };
    }

    // Merge
    const merged = this.mergeInput(input, aiExtract.fields);
    const csa = merged.csa as number | undefined;
    const material = this.normalizeMaterial(merged.conductorMaterial);
    const cls = this.normalizeClass(merged.conductorClass);
    const voltage = merged.voltage as string | undefined;
    const insulationMaterial = this.normalizeInsulationMaterial(merged.insulationMaterial);
    const tiProvided = merged.insulationThickness as number | undefined;
    const sheathProvided = merged.sheathThickness as number | undefined;
    const outerDiameter = merged.outerDiameter as number | undefined;

    const fieldResults: FieldValidationDto[] = [];
    const calc: ValidationResultDto['calculated'] = {};

    // Conductor Validation
    let conductor: any = null;
    if (csa && material && cls) {
      conductor = await this.iecDataService.getConductor(csa, material, cls);

      if (!conductor) {
        fieldResults.push(
          this.buildFieldResult(
            'conductor_geometry',
            'FAIL',
            { csa, material, class: cls },
            null,
            'No matching IEC conductor row found.',
          ),
        );
      } else {
        calc.conductorDiameter = conductor.nominal_diameter;

        fieldResults.push(
          this.buildFieldResult(
            'conductor_geometry',
            'PASS',
            { csa, material, class: cls },
            {
              nominal_diameter: conductor.nominal_diameter,
              strand_config: conductor.strand_config,
            },
            'Matches IEC 60228 conductor geometry.',
          ),
        );
      }
    } else {
      fieldResults.push(
        this.buildFieldResult(
          'conductor_geometry',
          'WARN',
          { csa, material, class: cls },
          null,
          'Insufficient data to validate conductor geometry.',
        ),
      );
    }

    // INSULATION THICKNESS

    let insulation: any = null;
    if (voltage && insulationMaterial && csa) {
      insulation = await this.iecDataService.getInsulation(voltage, insulationMaterial, csa);

      if (!insulation) {
        fieldResults.push(
          this.buildFieldResult(
            'insulation_thickness',
            'FAIL',
            tiProvided,
            null,
            'No matching IEC insulation rule.',
          ),
        );
      } else {
        const nominalTi = insulation.nominal_ti;
        const minTi = nominalTi * insulation.min_ti_factor;

        calc.insulationNominal = nominalTi;
        calc.insulationMinAllowed = minTi;
        if (tiProvided == null) {
          fieldResults.push(
            this.buildFieldResult(
              'insulation_thickness',
              'WARN',
              null,
              `${nominalTi} mm nominal, min ${minTi.toFixed(2)} mm`,
              'No insulation thickness provided.',
            ),
          );
        } else if (tiProvided < minTi) {
          fieldResults.push(
            this.buildFieldResult(
              'insulation_thickness',
              'FAIL',
              tiProvided,
              `${nominalTi} mm nominal, min ${minTi.toFixed(2)} mm`,
              'Below IEC minimum thickness.',
            ),
          );
        } else if (Math.abs(tiProvided - nominalTi) <= 0.1) {
          fieldResults.push(
            this.buildFieldResult(
              'insulation_thickness',
              'PASS',
              tiProvided,
              `${nominalTi} mm nominal`,
              'Matches IEC nominal thickness.',
            ),
          );
        } else {
          fieldResults.push(
            this.buildFieldResult(
              'insulation_thickness',
              'WARN',
              tiProvided,
              `${nominalTi} mm nominal, min ${minTi.toFixed(2)} mm`,
              'Within IEC but deviates from nominal.',
            ),
          );
        }
      }
    } else {
      fieldResults.push(
        this.buildFieldResult(
          'insulation_thickness',
          'WARN',
          tiProvided,
          null,
          'Missing voltage or insulation material.',
        ),
      );
    }

    // Sheath
    if (conductor && tiProvided != null) {
      const fictitiousDiameter = conductor.nominal_diameter + 2 * tiProvided;
      calc.fictitiousDiameter = fictitiousDiameter;

      const rules = await this.iecDataService.getSheathRules();
      if (!rules.length) {
        fieldResults.push(
          this.buildFieldResult('sheath_thickness', 'WARN', sheathProvided, null,
            'No sheath rules found.'),
        );
      } else {
        const rule = rules.find(r => r.depends_on_diameter) ?? rules[0];
        // bedding
        const beddingThickness =
          (rule.bedding_coeff_a ?? 0) +
          (rule.bedding_coeff_b ?? 0) * fictitiousDiameter;

        calc.beddingThickness = beddingThickness;

        const expectedSheath =
          rule.formula_coeff_a + rule.formula_coeff_b * fictitiousDiameter;

        calc.expectedSheathThickness = expectedSheath;

        if (sheathProvided == null) {
          fieldResults.push(
            this.buildFieldResult(
              'sheath_thickness',
              'WARN',
              null,
              `Expected ≈${expectedSheath.toFixed(2)} mm`,
              'No sheath thickness provided.',
            ),
          );
        } else if (
          sheathProvided < rule.min_sheath_thickness ||
          sheathProvided > rule.max_sheath_thickness
        ) {
          fieldResults.push(
            this.buildFieldResult(
              'sheath_thickness',
              'FAIL',
              sheathProvided,
              `Allowed range ${rule.min_sheath_thickness}-${rule.max_sheath_thickness} mm`,
              'Sheath thickness outside IEC range.',
            ),
          );
        } else {
          fieldResults.push(
            this.buildFieldResult(
              'sheath_thickness',
              Math.abs(sheathProvided - expectedSheath) / expectedSheath < 0.05
                ? 'PASS'
                : 'WARN',
              sheathProvided,
              `Expected ≈${expectedSheath.toFixed(2)} mm`,
              'Sheath thickness analyzed.',
            ),
          );
        }

        // Outer Diameter
        const expectedOD =
          fictitiousDiameter + 2 * beddingThickness + 2 * expectedSheath;

        calc.expectedOuterDiameter = expectedOD;

        const odMin = expectedOD * 0.95;
        const odMax = expectedOD * 1.05;

        calc.outerDiameterMin = odMin;
        calc.outerDiameterMax = odMax;

        if (outerDiameter == null) {
          fieldResults.push(
            this.buildFieldResult(
              'outer_diameter',
              'WARN',
              null,
              `Expected ≈${expectedOD.toFixed(2)} mm`,
              'No OD provided.',
            ),
          );
        } else if (outerDiameter < odMin || outerDiameter > odMax) {
          fieldResults.push(
            this.buildFieldResult(
              'outer_diameter',
              'FAIL',
              outerDiameter,
              `Range ${odMin.toFixed(2)}-${odMax.toFixed(2)} mm`,
              'Outside diameter outside IEC tolerance.',
            ),
          );
        } else {
          fieldResults.push(
            this.buildFieldResult(
              'outer_diameter',
              Math.abs(outerDiameter - expectedOD) / expectedOD < 0.02
                ? 'PASS'
                : 'WARN',
              outerDiameter,
              `Expected ≈${expectedOD.toFixed(2)} mm`,
              'OD validation completed.',
            ),
          );
        }
      }
    }
    
    const overall: ValidationResultDto['overallStatus'] =
      fieldResults.some(f => f.status === 'FAIL')
        ? 'FAIL'
        : fieldResults.some(f => f.status === 'WARN')
        ? 'WARN'
        : 'PASS';
    return {
      overallStatus: overall,
      fields: fieldResults,
      mergedInput: merged,
      calculated: calc,
      aiRaw: aiExtract,
    };
  }
}
