import { userService } from './user.service';

describe('User Service', () => {
  test('getProfile should return user data', async () => {
    const mockUserId = '1';
    const result = await userService.getProfile(mockUserId);
    expect(result).toHaveProperty('id', mockUserId);
  });

  test('getPublicProfile should return public user data', async () => {
    const mockUserId = '1';
    const result = await userService.getPublicProfile(mockUserId);
    expect(result).toHaveProperty('id', mockUserId);
    expect(result).not.toHaveProperty('email');
  });

  test('updateProfile should update user data', async () => {
    const mockUserId = '1';
    const mockData = { username: 'newUsername' };
    const result = await userService.updateProfile(mockUserId, mockData);
    expect(result).toHaveProperty('username', 'newUsername');
  });

  test('setXpAndCoins should update points and coins', async () => {
    const mockUserId = '1';
    const result = await userService.setXpAndCoins(mockUserId, 100, 50);
    expect(result).toHaveProperty('points');
    expect(result).toHaveProperty('coins');
  });
});