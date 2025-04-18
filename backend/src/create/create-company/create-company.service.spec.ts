import { Test, TestingModule } from '@nestjs/testing';
import { CreateCompanyService } from './create-company.service';

describe('CreateCompanyService', () => {
  let service: CreateCompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateCompanyService],
    }).compile();

    service = module.get<CreateCompanyService>(CreateCompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
