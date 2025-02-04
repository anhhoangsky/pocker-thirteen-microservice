import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const mockAppService = {
      getHello: jest.fn().mockReturnValue('Hello World!')
    };

    const moduleFixture = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
      {
        provide: AppService,
        useValue: mockAppService
      }
      ]
    }).compile();

    appController = moduleFixture.get<AppController>(AppController);
    appService = moduleFixture.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const result = appController.getHello();
      expect(result).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });
});
