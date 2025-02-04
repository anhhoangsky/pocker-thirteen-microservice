import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => ({
	NestFactory: {
		create: jest.fn()
	}
}));

describe('Main', () => {
	let mockApp: Partial<INestApplication>;
	const originalEnv = process.env;

	beforeEach(() => {
		mockApp = {
			listen: jest.fn().mockResolvedValue(undefined)
		};
		(NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		jest.clearAllMocks();
		process.env = originalEnv;
	});

	it('should bootstrap application with default port 3000', async () => {
		await bootstrap();
		expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
		expect(mockApp.listen).toHaveBeenCalledWith(3000);
		expect(mockApp.listen).toHaveBeenCalledTimes(1);
	});

	it('should bootstrap application with custom port from env', async () => {
		process.env.PORT = '4000';
		await bootstrap();
		expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
		expect(mockApp.listen).toHaveBeenCalledWith('4000');
		expect(mockApp.listen).toHaveBeenCalledTimes(1);
	});
});

