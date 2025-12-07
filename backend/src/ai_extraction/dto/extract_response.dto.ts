export class ExtractResponseDto {
  fields: {
    standard: string | null;
    voltage: string | null;
    conductor_material: string | null;
    conductor_class: string | null;
    csa: number | null;
    insulation_material: string | null;
    insulation_thickness: number | null;
    sheath_thickness: number | null;
    outer_diameter: number | null;
    armour: string | null;
    bedding: string | null;
    sheath_material: string | null;
  };

  confidence: {
    standard: number;
    voltage: number;
    conductor_material: number;
    conductor_class: number;
    csa: number;
    insulation_material: number;
    insulation_thickness: number;
    sheath_thickness: number;
    outer_diameter: number;
    armour: number;
    bedding: number;
    sheath_material: number;
  };
}
