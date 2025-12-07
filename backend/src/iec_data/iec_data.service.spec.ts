import { Test, TestingModule } from '@nestjs/testing';
import { IecDataService } from './iec_data.service';

describe('IecDataService', () => {
  let service: IecDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IecDataService],
    }).compile();

    service = module.get<IecDataService>(IecDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
