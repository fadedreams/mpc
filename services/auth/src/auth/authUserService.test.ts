
import { AuthUserService } from './authUserService'; // Adjust the path accordingly
import { RabbitMQManager } from '@auth/broker/rabbitMQManager'; // Adjust the path accordingly
import { Model } from 'sequelize';
import { configInstance as config } from '@auth/config';
describe('AuthUserService', () => {
  let authUserService: AuthUserService;

  beforeEach(() => {
    // Mocking RabbitMQManager to avoid actual connection attempts during tests
    const mockRabbitMQManager = {
      publishDirectMessage: jest.fn(),
    } as unknown as RabbitMQManager;

    authUserService = new AuthUserService(config); // Mock config, use 'testChannel'
    authUserService['rbmqmanager'] = mockRabbitMQManager;
  });

  it('should publish a message when calling publishBuyerUpdateMessage', async () => {
    // Mocking a Sequelize Model
    const mockResult = {
      dataValues: {
        username: 'testUsername',
        email: 'test@example.com',
        profilePicture: 'test.jpg',
        country: 'testCountry',
        createdAt: '2022-01-01T00:00:00.000Z',
      },
    } as unknown as Model;

    await authUserService['publishBuyerUpdateMessage'](mockResult);

    // Expect the publishDirectMessage method to be called with the expected arguments
    expect(authUserService['rbmqmanager'].publishDirectMessage).toHaveBeenCalledWith(
      'mpc-buyer-update',
      'user-buyer',
      JSON.stringify({
        username: 'testUsername',
        email: 'test@example.com',
        profilePicture: 'test.jpg',
        country: 'testCountry',
        createdAt: '2022-01-01T00:00:00.000Z',
        type: 'auth',
      }),
      'Buyer details sent to buyer service.'
    );
  });
});
