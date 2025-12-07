import { Body, Controller, Post } from '@nestjs/common';
import { DesignValidationService } from './design_validation.service';
import { DesignInputDto } from './dto/design_input.dto';
import { ValidationResultDto } from './dto/validation_result.dto';

@Controller('design')
export class DesignValidationController {
  constructor(
    private readonly designValidationService: DesignValidationService,
  ) {}

  @Post('validate')
  async validate(
    @Body() body: DesignInputDto,
  ): Promise<ValidationResultDto> {
    return this.designValidationService.validateDesign(body);
  }
}
