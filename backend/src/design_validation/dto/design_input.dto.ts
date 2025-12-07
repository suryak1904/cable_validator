export class DesignInputDto {
  standard?: string;
  voltage?: string;

  conductorMaterial?: string;
  conductorClass?: string;
  csa?: number;

  insulationMaterial?: string;
  insulationThickness?: number;

  sheathThickness?: number;

  outerDiameter?: number;

  freeText?: string;
}
