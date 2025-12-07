import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AiExtractionService } from './ai_extraction/ai_extraction.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aiExtractionService: AiExtractionService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test-ai')
  async testAi() {
    try {
      return await this.aiExtractionService.extractFields(
        'IEC 60502-1 10 sqmm Cu Class 2 PVC 1.0 mm LV cable',
      );
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
