import { Test, TestingModule } from '@nestjs/testing';
import { DesignValidationService } from './design_validation.service';

describe('DesignValidationService', () => {
  let service: DesignValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DesignValidationService],
    }).compile();

    service = module.get<DesignValidationService>(DesignValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
