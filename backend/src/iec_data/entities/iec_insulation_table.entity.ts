import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('iec_insulation_table')
export class IecInsulation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  voltage_grade: string;

  @Column()
  insulation_material: string;

  @Column()
  csa_min: number;

  @Column()
  csa_max: number;

  @Column({ type: 'float' })
  nominal_ti: number;

  @Column({ type: 'float' })
  min_ti_factor: number;
}
