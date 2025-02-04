jest.setTimeout(30000);

const mockTestingModule = {
		get: jest.fn().mockImplementation((token) => {
				if (typeof token === 'function') {
						return new token();
				}
				return {};
		})
};

const mockTestingModuleBuilder = {
		compile: jest.fn().mockResolvedValue(mockTestingModule),
		overrideProvider: jest.fn().mockReturnThis(),
		useValue: jest.fn().mockReturnThis()
};

jest.mock('@nestjs/testing', () => ({
		Test: {
				createTestingModule: jest.fn().mockImplementation(() => mockTestingModuleBuilder)
		},
		TestingModule: jest.fn().mockImplementation(() => mockTestingModule)
}));

// Mock NestJS core
jest.mock('@nestjs/core', () => ({
	NestFactory: {
		create: jest.fn().mockImplementation(() => ({
			listen: jest.fn().mockResolvedValue(undefined)
		})),
		createMicroservice: jest.fn().mockImplementation(() => ({
			listen: jest.fn().mockResolvedValue(undefined)
		}))
	}
}));

// Mock NestJS config
jest.mock('@nestjs/config', () => ({
	ConfigService: jest.fn().mockImplementation(() => ({
		get: jest.fn()
	})),
	ConfigModule: {
		forRoot: jest.fn().mockReturnValue({})
	}
}));

// Mock NestJS microservices
jest.mock('@nestjs/microservices', () => ({
	Transport: { TCP: 'TCP' },
	MessagePattern: () => jest.fn(),
	Payload: () => jest.fn(),
	ClientsModule: {
		register: jest.fn().mockReturnValue({})
	},
	ClientProxy: jest.fn().mockImplementation(() => ({
		send: jest.fn().mockReturnValue({
			toPromise: jest.fn().mockResolvedValue({})
		})
	}))
}));

// Mock TypeORM
const mockRepository = {
	find: jest.fn(),
	findOne: jest.fn(),
	save: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn()
};

jest.mock('@nestjs/typeorm', () => ({
	TypeOrmModule: {
		forRoot: jest.fn().mockReturnValue({}),
		forFeature: jest.fn().mockReturnValue({})
	},
	getRepositoryToken: jest.fn().mockReturnValue('MockRepositoryToken'),
	InjectRepository: () => jest.fn(),
	Repository: jest.fn().mockImplementation(() => mockRepository)
}));

jest.mock('typeorm', () => {
	const originalModule = jest.requireActual('typeorm');
	return {
		...originalModule,
		DataSource: jest.fn().mockImplementation(() => ({
			initialize: jest.fn().mockResolvedValue({}),
			destroy: jest.fn().mockResolvedValue({}),
			manager: {
				transaction: jest.fn()
			}
		}))
	};
});

// Global mocks
global.InjectRepository = jest.fn();
global.MessagePattern = jest.fn();
global.Payload = jest.fn();

// Suppress console during tests
global.console = {
	...console,
	log: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};

