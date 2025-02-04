import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppModule } from './app.module';

describe('AppModule', () => {
	let module: any;
	let controller: AppController;
	let service: AppService;

	beforeAll(async () => {
		const mockAppService = {
			getHello: jest.fn().mockReturnValue('Hello World!')
		};

		module = await Test.createTestingModule({
			imports: [AppModule],
			providers: [
				{
					provide: AppService,
					useValue: mockAppService
				}
			]
		}).compile();

		controller = module.get(AppController);
		service = module.get(AppService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(module).toBeDefined();
	});

	it('should have AppController', () => {
		expect(controller).toBeDefined();
		expect(controller.getHello).toBeDefined();
		expect(typeof controller.getHello).toBe('function');
	});

	it('should have AppService', () => {
		expect(service).toBeDefined();
		expect(service.getHello).toBeDefined();
		expect(typeof service.getHello).toBe('function');
	});
});