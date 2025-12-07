import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IecDataService } from './iec_data.service';
import { IecConductor } from './entities/iec_conductor_table.entity';
import { IecInsulation } from './entities/iec_insulation_table.entity';
import { IecSheathRules } from './entities/iec_sheath_rules.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IecConductor,
      IecInsulation,
      IecSheathRules
    ]),
  ],
  providers: [IecDataService],
  exports: [IecDataService],
})
export class IecDataModule {}
