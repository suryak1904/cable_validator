import { DataSource } from 'typeorm';
import { IecConductor } from '../../iec_data/entities/iec_conductor_table.entity';
import { IecInsulation } from '../../iec_data/entities/iec_insulation_table.entity';
import { IecSheathRules } from '../../iec_data/entities/iec_sheath_rules.entity';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [IecConductor, IecInsulation, IecSheathRules],
  synchronize: true,
});

async function seedIEC() {
  await AppDataSource.initialize();
  console.log('Connected to DB. Seeding IEC data.');

  await AppDataSource.query(`
    TRUNCATE TABLE iec_conductor_table, iec_insulation_table, iec_sheath_rules
    RESTART IDENTITY CASCADE;
  `);
  console.log('Cleared existing IEC tables.');
  // Conductor Table
  const conductorRows = [
    { csa: 10, material: 'Cu', class: '2', nominal_diameter: 4.05, strand_config: '7/1.35' },
    { csa: 16, material: 'Cu', class: '2', nominal_diameter: 5.10, strand_config: '7/1.70' },
    { csa: 25, material: 'Cu', class: '2', nominal_diameter: 6.50, strand_config: '7/2.14' },
    { csa: 35, material: 'Cu', class: '2', nominal_diameter: 7.80, strand_config: '7/2.52' },

    { csa: 16, material: 'Al', class: '2', nominal_diameter: 5.60, strand_config: '7/1.80' },
    { csa: 25, material: 'Al', class: '2', nominal_diameter: 7.00, strand_config: '7/2.14' },
    { csa: 35, material: 'Al', class: '2', nominal_diameter: 8.20, strand_config: '7/2.52' },
  ];
  await AppDataSource.getRepository(IecConductor).save(conductorRows);
  console.log('✔ Conductor table seeded.');
  // Insulation Table 
  const insulationRows = [
    { voltage_grade: '0.6/1 kV', insulation_material: 'PVC',  csa_min: 1,  csa_max: 16, nominal_ti: 1.0, min_ti_factor: 0.9 },
    { voltage_grade: '0.6/1 kV', insulation_material: 'PVC',  csa_min: 25, csa_max: 35, nominal_ti: 1.2, min_ti_factor: 0.9 },

    { voltage_grade: '0.6/1 kV', insulation_material: 'XLPE', csa_min: 1,  csa_max: 16, nominal_ti: 0.7, min_ti_factor: 0.9 },
    { voltage_grade: '0.6/1 kV', insulation_material: 'XLPE', csa_min: 25, csa_max: 35, nominal_ti: 0.9, min_ti_factor: 0.9 },
  ];
  await AppDataSource.getRepository(IecInsulation).save(insulationRows);
  console.log('✔ Insulation table seeded.');
 const sheathRows = [
  {
    formula_coeff_a: 1.2,
    formula_coeff_b: 0.03,
    depends_on_diameter: true,
    min_sheath_thickness: 1.4,
    max_sheath_thickness: 2.2,
    bedding_coeff_a: 0.5,
    bedding_coeff_b: 0.01
  },
  {
    formula_coeff_a: 1.3,
    formula_coeff_b: 0.04,
    depends_on_diameter: true,
    min_sheath_thickness: 1.5,
    max_sheath_thickness: 2.4,
    bedding_coeff_a: 0.4,
    bedding_coeff_b: 0.015
  },
  {
    formula_coeff_a: 1.1,
    formula_coeff_b: 0.025,
    depends_on_diameter: false,
    min_sheath_thickness: 1.4,
    max_sheath_thickness: 2.0,
    bedding_coeff_a: 0.3,
    bedding_coeff_b: 0.02
  }
];
  await AppDataSource.getRepository(IecSheathRules).save(sheathRows);
  console.log('Sheath rules table seeded.');

  console.log('IEC seeding completed successfully!');
  process.exit(0);
}

seedIEC();
