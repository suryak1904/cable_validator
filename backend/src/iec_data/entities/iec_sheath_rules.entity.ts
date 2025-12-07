import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('iec_sheath_rules')
export class IecSheathRules {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  formula_coeff_a: number;

  @Column({ type: 'float' })
  formula_coeff_b: number;

  @Column({ default: true })
  depends_on_diameter: boolean;

  @Column({ type: 'float' })
  min_sheath_thickness: number;

  @Column({ type: 'float' })
  max_sheath_thickness: number;

  @Column({ type: 'float', default: 0 })
  bedding_coeff_a: number;

  @Column({ type: 'float', default: 0 })
  bedding_coeff_b: number;
}
