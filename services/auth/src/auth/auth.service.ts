import { configInstance as config } from '@auth/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { AuthProducer } from '@auth/broker/authProducer';  // Import AuthProducer
import { Logger } from 'winston';
import { omit } from 'lodash';
import { Model, Op } from 'sequelize';
import { AuthModel } from '@auth/auth/models/auth.schema';
import { IAuthBuyerMessageDetails, IAuthDocument } from '@auth/auth/middleware/express.d';
import { Config } from '@auth/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authService', 'debug');
const authChannel: string = 'your_auth_channel_name';  // Replace with your actual channel name

class AuthUserService {
  private log: Logger;
  private authChannel: string;
  private authProducer: AuthProducer;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authService', 'debug');
    this.authChannel = 'your_auth_channel_name';
    this.authProducer = new AuthProducer(config);
  }

  private async publishBuyerUpdateMessage(result: Model): Promise<void> {
    const messageDetails: IAuthBuyerMessageDetails = {
      username: result.dataValues.username!,
      email: result.dataValues.email!,
      profilePicture: result.dataValues.profilePicture!,
      country: result.dataValues.country!,
      createdAt: result.dataValues.createdAt!,
      type: 'auth',
    };

    await this.authProducer.publishDirectMessage(  // Use AuthProducer instance
      this.authChannel,
      'jobber-buyer-update',
      'user-buyer',
      JSON.stringify(messageDetails),
      'Buyer details sent to buyer service.'
    );
  }

  public async createAuthUser(data: IAuthDocument): Promise<IAuthDocument | undefined> {
    try {
      const result: Model = await AuthModel.create(data);
      await this.publishBuyerUpdateMessage(result);

      const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
      return userData;
    } catch (error) {
      this.log.error(error);
    }
  }
}

export default AuthUserService;
