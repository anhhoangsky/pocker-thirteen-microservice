export const createMockRepository = <T = any>() => ({
	find: jest.fn(),
	findOne: jest.fn(),
	save: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	createQueryBuilder: jest.fn(() => ({
		where: jest.fn().mockReturnThis(),
		andWhere: jest.fn().mockReturnThis(),
		leftJoinAndSelect: jest.fn().mockReturnThis(),
		getOne: jest.fn(),
		getMany: jest.fn(),
		execute: jest.fn()
	}))
});
