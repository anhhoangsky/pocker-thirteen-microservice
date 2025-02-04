import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let mockAppService: jest.Mocked<AppService>;

  beforeEach(async () => {
    mockAppService = {
      getHello: jest.fn().mockReturnValue('Hello World!')
    } as any;

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService
        }
      ]
    }).compile();

    controller = moduleRef.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const result = controller.getHello();
      expect(result).toBe('Hello World!');
      expect(mockAppService.getHello).toHaveBeenCalled();
    });
  });
});
