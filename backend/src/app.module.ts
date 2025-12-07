import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiExtractionModule } from './ai_extraction/ai_extraction.module';
import { IecDataModule } from './iec_data/iec_data.module';
import { IecConductor } from './iec_data/entities/iec_conductor_table.entity';
import { IecInsulation } from './iec_data/entities/iec_insulation_table.entity';
import { IecSheathRules } from './iec_data/entities/iec_sheath_rules.entity';
import { DesignValidationModule } from './design_validation/design_validation.module';
import * as dotenv from 'dotenv';
dotenv.config();  

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [IecConductor, IecInsulation, IecSheathRules],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    AiExtractionModule,
    IecDataModule,
    DesignValidationModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
