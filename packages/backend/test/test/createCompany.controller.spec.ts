import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../../src/app.service';
import { PrismaClient } from '@prisma/client';

describe('AppService', () => {
  let appService: AppService;
  let prismaClient: PrismaClient;
  let createdCompanyId: number | null = null; // Переменная для хранения id созданной компании

  beforeAll(() => {
    prismaClient = new PrismaClient(); // создаем экземпляр PrismaClient
  });

  beforeEach(() => {
    appService = new AppService(); // создаем сервис с PrismaClient
  });

  it('should create a company', async () => {
    const newCompany = await appService.createCompany('LLC "Test organization"');

    // Сохраняем id созданной компании для дальнейшего удаления
    createdCompanyId = newCompany.idCompany;

    // Проверяем, что компания создана с правильными данными
    expect(newCompany).toHaveProperty('idCompany');
    expect(newCompany.name).toBe('LLC "Test organization"');
  });

  afterAll(async () => {
    // Если компания была создана, удаляем её
    if (createdCompanyId) {
      await prismaClient.company.delete({
        where: { idCompany: createdCompanyId }, // Удаляем только созданную компанию
      });
    }
    await prismaClient.$disconnect(); // отключение от базы данных
  });
});
