import { Module } from '@nestjs/common';
import { AiExtractionService } from './ai_extraction.service';

@Module({
  providers: [AiExtractionService],
  exports: [AiExtractionService],
})
export class AiExtractionModule {}
