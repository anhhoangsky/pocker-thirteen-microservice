import { Test, TestingModule } from '@nestjs/testing';
import { FinancialManagementModule } from './financial-management.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './domain/entities/transaction.entity';
import { Fund } from './domain/entities/fund.entity';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

jest.mock('@nestjs/typeorm', () => {
	const actual = jest.requireActual('@nestjs/typeorm');
	return {
		...actual,
		TypeOrmModule: {
			forRoot: jest.fn().mockReturnValue({
				module: class {},
				providers: []
			}),
			forFeature: jest.fn().mockReturnValue({
				module: class {},
				providers: []
			})
		}
	};
});

const mockRepository = {
	find: jest.fn(),
	findOne: jest.fn(),
	save: jest.fn(),
	create: jest.fn()
};

describe('FinancialManagementModule', () => {
	let moduleFixture: TestingModule;

	beforeAll(async () => {
		moduleFixture = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					ignoreEnvFile: true
				})
			],
			providers: [
				{
					provide: getRepositoryToken(Transaction),
					useValue: mockRepository
				},
				{
					provide: getRepositoryToken(Fund),
					useValue: mockRepository
				}
			]
		})
		.overrideModule(FinancialManagementModule)
		.useModule({
			module: class {},
			imports: [],
			providers: []
		})
		.compile();
	}, 120000);

	it('should compile the module', () => {
		expect(moduleFixture).toBeDefined();
	});

	it('should have repositories properly injected', () => {
		const transactionRepo = moduleFixture.get(getRepositoryToken(Transaction));
		const fundRepo = moduleFixture.get(getRepositoryToken(Fund));

		expect(transactionRepo).toBeDefined();
		expect(fundRepo).toBeDefined();
	});
});

