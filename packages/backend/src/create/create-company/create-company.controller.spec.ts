import { Test, TestingModule } from '@nestjs/testing';
import { CreateCompanyController } from './create-company.controller';

describe('CreateCompanyController', () => {
  let controller: CreateCompanyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateCompanyController],
    }).compile();

    controller = module.get<CreateCompanyController>(CreateCompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
