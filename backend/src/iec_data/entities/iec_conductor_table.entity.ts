import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('iec_conductor_table')
export class IecConductor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  csa: number;

  @Column()
  material: string;

  @Column()
  class: string;

  @Column({ type: 'float' })
  nominal_diameter: number;

  @Column()
  strand_config: string;
}
