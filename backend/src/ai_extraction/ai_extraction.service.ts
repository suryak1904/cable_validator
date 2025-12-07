/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractResponseDto } from './dto/extract_response.dto';

@Injectable()
export class AiExtractionService {
  private readonly logger = new Logger(AiExtractionService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      this.logger.error('❌ GEMINI_API_KEY is missing in .env');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  // Return a fully structured empty DTO
  private emptyResult(): ExtractResponseDto {
    return {
      fields: {
        standard: null,
        voltage: null,
        conductor_material: null,
        conductor_class: null,
        csa: null,
        insulation_material: null,
        insulation_thickness: null,
        sheath_thickness: null,
        outer_diameter: null,
        armour: null,
        bedding: null,
        sheath_material: null
      },
      confidence: {
        standard: 0,
        voltage: 0,
        conductor_material: 0,
        conductor_class: 0,
        csa: 0,
        insulation_material: 0,
        insulation_thickness: 0,
        sheath_thickness: 0,
        outer_diameter: 0,
        armour: 0,
        bedding: 0,
        sheath_material: 0
      }
    };
  }


  private buildPrompt(text: string): string {
    return `
You are an AI that extracts **LOW VOLTAGE CABLE DESIGN PARAMETERS** from free text.
You MUST follow EXACT extraction rules because another strict validation engine depends on you.

==========================
STRICT EXTRACTION RULES
==========================
1. Extract ONLY values explicitly present in the text.
2. DO NOT infer or guess anything.
3. Normalize values using these rules:
   - Voltage → must be exactly "0.6/1 kV" (spaces allowed but fix formats like "0.6/1kV")
   - Conductor material → detect & output only "Cu" or "Al"
   - Conductor class → extract numbers only (1,2,5,6)
   - CSA → numeric only (e.g., "10 sqmm" → 10)
   - Insulation thickness → numeric (e.g., "1.0mm" → 1)
   - Sheath thickness → numeric if present
   - Outer diameter → numeric (e.g., "OD 8.5mm" → 8.5)
4. If a parameter does NOT appear in the text, set it to null.
5. ALWAYS return **VALID JSON ONLY**. No markdown. No comments.

==========================
VALID OUTPUT FORMAT
==========================

{
  "fields": {
    "standard": null,
    "voltage": null,
    "conductor_material": null,
    "conductor_class": null,
    "csa": null,
    "insulation_material": null,
    "insulation_thickness": null,
    "sheath_thickness": null,
    "outer_diameter": null,
    "armour": null,
    "bedding": null,
    "sheath_material": null
  },
  "confidence": {
    "standard": 0.0,
    "voltage": 0.0,
    "conductor_material": 0.0,
    "conductor_class": 0.0,
    "csa": 0.0,
    "insulation_material": 0.0,
    "insulation_thickness": 0.0,
    "sheath_thickness": 0.0,
    "outer_diameter": 0.0,
    "armour": 0.0,
    "bedding": 0.0,
    "sheath_material": 0.0
  }
}

==========================
TEXT TO ANALYZE
==========================
"${text}"

Return ONLY the JSON.
`;
  }

  async extractFields(text: string): Promise<ExtractResponseDto> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'models/gemini-2.5-flash',
      });

      const result = await model.generateContent(this.buildPrompt(text));

      let raw = result.response.text().trim();
      raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsed: ExtractResponseDto;

      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        this.logger.error("AI returned invalid JSON:", raw);
        return this.emptyResult();
      }

      return parsed;

    } catch (error) {
      this.logger.error('AI Extraction failed:', error);
      return this.emptyResult();
    }
  }
}
