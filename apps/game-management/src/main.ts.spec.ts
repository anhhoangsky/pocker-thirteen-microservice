import { NestFactory } from '@nestjs/core';
import { GameManagementModule } from './game-management.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => ({
	NestFactory: {
		createMicroservice: jest.fn()
	}
}));

describe('Main', () => {
	let mockApp: any;

	beforeEach(() => {
		mockApp = {
			listen: jest.fn().mockResolvedValue(undefined)
		};
		(NestFactory.createMicroservice as jest.Mock).mockResolvedValue(mockApp);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should bootstrap application with default port 3000', async () => {
		await bootstrap();
		expect(NestFactory.createMicroservice).toHaveBeenCalledWith(GameManagementModule, {
			transport: Transport.TCP,
			options: {
				host: 'localhost',
				port: 3002,
			},
		});
		expect(mockApp.listen).toHaveBeenCalled();
	});

	it('should bootstrap application with custom port from env', async () => {
		process.env.PORT = '4000';
		await bootstrap();
		expect(NestFactory.createMicroservice).toHaveBeenCalledWith(GameManagementModule, {
			transport: Transport.TCP,
			options: {
				host: 'localhost',
				port: 3002,
			},
		});
		expect(mockApp.listen).toHaveBeenCalled();
	});

});