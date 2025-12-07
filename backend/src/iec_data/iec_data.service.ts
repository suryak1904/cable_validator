import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

import { IecConductor } from './entities/iec_conductor_table.entity';
import { IecInsulation } from './entities/iec_insulation_table.entity';
import { IecSheathRules } from './entities/iec_sheath_rules.entity';

@Injectable()
export class IecDataService {
  constructor(
    @InjectRepository(IecConductor)
    private conductorRepo: Repository<IecConductor>,

    @InjectRepository(IecInsulation)
    private insulationRepo: Repository<IecInsulation>,

    @InjectRepository(IecSheathRules)
    private sheathRepo: Repository<IecSheathRules>,
  ) {}

  private normalizeMaterial(mat?: string): string | null {
    if (!mat) return null;
    const m = mat.toLowerCase();
    if (m.includes('cu')) return 'Cu';
    if (m.includes('al')) return 'Al';
    return mat.trim();
  }

  private normalizeClass(cls?: string): string | null {
    if (!cls) return null;
    return cls.replace(/[^0-9]/g, '');
  }

  private normalizeVoltage(voltage?: string): string | null {
    if (!voltage) return null;

    let v = voltage.toLowerCase().replace(/\s+/g, '');

    const match = v.match(/(\d+\.?\d*)[\/]?(\d+\.?\d*)/);

    const hasKV = v.includes('kv');

    if (match) {
      const left = match[1];
      const right = match[2];

      if (hasKV) {
        return `${left}/${right} kV`;
      }

      if (Number(left) > 10 && Number(right) > 10) {
        return `${Number(left) / 1000}/${Number(right) / 1000} kV`;
      }

      return `${left}/${right} kV`;
    }

    return voltage;
  }

  async getConductor(csa: number, material: string, cls: string) {
    const mat = this.normalizeMaterial(material);
    const c = this.normalizeClass(cls);

    const where: any = { csa };
    if (mat) where.material = mat;
    if (c) where.class = c;

    return this.conductorRepo.findOne({ where });
  }

  async getInsulation(voltage: string, material: string, csa: number) {
    const v = this.normalizeVoltage(voltage);
    const mat = this.normalizeMaterial(material);

    const where: any = {
      csa_min: LessThanOrEqual(csa),
      csa_max: MoreThanOrEqual(csa),
    };

    if (v) where.voltage_grade = v;
    if (mat) where.insulation_material = mat;

    return this.insulationRepo.findOne({ where });
  }
  async getSheathRules() {
    return this.sheathRepo.find();
  }
}
