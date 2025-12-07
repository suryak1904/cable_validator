import { Test, TestingModule } from '@nestjs/testing';
import { DesignValidationController } from './design_validation.controller';

describe('DesignValidationController', () => {
  let controller: DesignValidationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DesignValidationController],
    }).compile();

    controller = module.get<DesignValidationController>(DesignValidationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
