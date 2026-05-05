jest.mock('../repositories/user.repository', () => ({
  userRepository: {
    findAll: jest.fn(),
    searchByQuery: jest.fn(),
    findById: jest.fn(),
    findPublicById: jest.fn(),
    existsOtherWithUsername: jest.fn(),
    update: jest.fn(),
    updateStats: jest.fn(),
    updateTreeStage: jest.fn(),
  },
}));

import { userService } from './user.service';
import { userRepository } from '../repositories/user.repository';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  avatarUrl: null,
  role: 'USER',
  points: 10,
  coins: 20,
  level: 1,
  createdAt: '2026-05-05T00:00:00.000Z',
};

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    (userRepository.findPublicById as jest.Mock).mockResolvedValue({
      id: mockUser.id,
      username: mockUser.username,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      avatarUrl: mockUser.avatarUrl,
      level: mockUser.level,
      points: mockUser.points,
    });
    (userRepository.existsOtherWithUsername as jest.Mock).mockResolvedValue(false);
    (userRepository.update as jest.Mock).mockResolvedValue(undefined);
    (userRepository.updateStats as jest.Mock).mockResolvedValue(undefined);
    (userRepository.updateTreeStage as jest.Mock).mockResolvedValue(undefined);
  });

  test('getProfile should return user data', async () => {
    const result = await userService.getProfile(mockUser.id);
    expect(result).toHaveProperty('id', mockUser.id);
  });

  test('getPublicProfile should return public user data', async () => {
    const result = await userService.getPublicProfile(mockUser.id);
    expect(result).toHaveProperty('id', mockUser.id);
    expect(result).not.toHaveProperty('email');
  });

  test('updateProfile should update user data', async () => {
    const result = await userService.updateProfile(mockUser.id, { username: 'newUsername' });
    expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, { username: 'newUsername' });
    expect(result).toHaveProperty('id', mockUser.id);
  });

  test('setXpAndCoins should update points and coins', async () => {
    const result = await userService.setXpAndCoins(mockUser.id, 100, 50);
    expect(userRepository.updateStats).toHaveBeenCalledWith(mockUser.id, 100, 50, expect.any(Number));
    expect(userRepository.updateTreeStage).toHaveBeenCalled();
    expect(result).toMatchObject({ points: 100, coins: 50 });
  });
});
