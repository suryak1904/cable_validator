export type FieldStatus = 'PASS' | 'FAIL' | 'WARN';

export class FieldValidationDto {
  field: string;
  status: FieldStatus;
  provided: any;
  expected: any;
  comment: string;
}
