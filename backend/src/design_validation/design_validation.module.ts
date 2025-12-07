import { Module } from '@nestjs/common';
import { DesignValidationService } from './design_validation.service';
import { DesignValidationController } from './design_validation.controller';
import { AiExtractionModule } from '../ai_extraction/ai_extraction.module';
import { IecDataModule } from '../iec_data/iec_data.module';

@Module({
  imports: [AiExtractionModule, IecDataModule],
  providers: [DesignValidationService],
  controllers: [DesignValidationController],
  exports: [DesignValidationService],
})
export class DesignValidationModule {}
