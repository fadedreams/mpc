import { configInstance as config } from '@auth/config';
import { firstLetterUppercase, lowerCase, winstonLogger } from '@fadedreams7org1/mpclib';
import { RabbitMQManager } from '@auth/broker/rabbitMQManager';  // Import RabbitMQManager
import { Logger } from 'winston';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { Model, Op } from 'sequelize';
import { AuthModel } from '@auth/auth/models/auth.schema';
import { IAuthBuyerMessageDetails, IAuthDocument } from '@auth/auth/middleware/express.d';
import { Config } from '@auth/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authService', 'debug');
const authChannel: string = 'your_auth_channel_name';  // Replace with your actual channel name

export class AuthUserService {
  private log: Logger;
  private rbmqmanager: RabbitMQManager;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authService', 'debug');
    this.rbmqmanager = new RabbitMQManager(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
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

    await this.rbmqmanager.publishDirectMessage(
      'mpc-buyer-update',
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

  public async getAuthUserById(authId: number): Promise<IAuthDocument | undefined> {
    try {
      const user: Model = await AuthModel.findOne({
        where: { id: authId },
        attributes: {
          exclude: ['password'],
        },
      }) as Model;
      return user?.dataValues;
    } catch (error) {
      this.log.error(error);
    }
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | undefined> {
    try {
      const user: Model = await AuthModel.findOne({
        where: {
          [Op.or]: [{ username: firstLetterUppercase(username) }, { email: lowerCase(email) }],
        },
      }) as Model;
      return user?.dataValues;
    } catch (error) {
      this.log.error(error);
    }
  }

  public async getUserByUsername(username: string): Promise<IAuthDocument | undefined> {
    try {
      const user: Model = await AuthModel.findOne({
        where: { username: firstLetterUppercase(username) },
      }) as Model;
      return user?.dataValues;
    } catch (error) {
      this.log.error(error);
    }
  }

  public async getUserByEmail(email: string): Promise<IAuthDocument | undefined> {
    try {
      const user: Model = await AuthModel.findOne({
        where: { email: lowerCase(email) },
      }) as Model;
      return user?.dataValues;
    } catch (error) {
      this.log.error(error);
    }
  }

  public async getAuthUserByVerificationToken(token: string): Promise<IAuthDocument | undefined> {
    try {
      const user: Model = await AuthModel.findOne({
        where: { emailVerificationToken: token },
        attributes: {
          exclude: ['password'],
        },
      }) as Model;
      return user?.dataValues;
    } catch (error) {
      this.log.error(error);
    }
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument | undefined> {
    try {
      const user: Model = await AuthModel.findOne({
        where: {
          [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }],
        },
      }) as Model;
      return user?.dataValues;
    } catch (error) {
      this.log.error(error);
    }
  }

  public async updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken?: string): Promise<void> {
    try {
      await AuthModel.update(
        !emailVerificationToken ? {
          emailVerified,
        } : {
          emailVerified,
          emailVerificationToken,
        },
        { where: { id: authId } },
      );
    } catch (error) {
      this.log.error(error);
    }
  }

  public async updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
    try {
      await AuthModel.update(
        {
          passwordResetToken: token,
          passwordResetExpires: tokenExpiration,
        },
        { where: { id: authId } },
      );
    } catch (error) {
      this.log.error(error);
    }
  }

  public async updatePassword(authId: number, password: string): Promise<void> {
    try {
      await AuthModel.update(
        {
          password,
          passwordResetToken: '',
          passwordResetExpires: new Date(),
        },
        { where: { id: authId } },
      );
    } catch (error) {
      this.log.error(error);
    }
  }

  public signToken(id: number, email: string, username: string): string {
    return sign(
      {
        id,
        email,
        username,
      },
      this.config.JWT_TOKEN!,
    );
  }
}



