import { Request, Response } from 'express';
import { AuthUserService } from '@auth/auth/authUserService';
import { IAuthDocument, IEmailMessageDetails } from '@auth/auth/middleware/express.d';
import { BadRequestError, firstLetterUppercase, lowerCase } from '@fadedreams7org1/mpclib';
import { configInstance as config } from '@auth/config';
import { sign } from 'jsonwebtoken';
import crypto from 'crypto';
import { signupSchema } from '@auth/auth/schemas/signup';
import { StatusCodes } from 'http-status-codes';

class AuthController {
  private authService: AuthUserService;

  constructor() {
    this.authService = new AuthUserService(config);
  }

  public async create(req: Request, res: Response): Promise<void> {
    // await this.authService.publishDirectMessage(JSON.stringify("testing rb"));
    try {
      const { username, email, password } = req.body;
      console.info(username, email, password);
      const { error } = await Promise.resolve(signupSchema.validate(req.body));
      console.info(username, email, password);
      if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'SignUp create() method error');
      }

      const checkIfUserExist: IAuthDocument | undefined = await this.authService.getUserByUsernameOrEmail(username, email);
      if (checkIfUserExist) {
        throw new BadRequestError('Invalid credentials. Email or Username', 'SignUp create() method error');
      }

      const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
      const randomCharacters: string = randomBytes.toString('hex');
      const authData = {
        username: firstLetterUppercase(username),
        email: lowerCase(email),
        password,
        emailVerificationToken: randomCharacters,
      };

      const result: IAuthDocument | undefined = await this.authService.createAuthUser(authData);
      if (!result) {
        throw new BadRequestError('Failed to create user', 'SignUp create() method error');
      }

      const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
      const messageDetails: IEmailMessageDetails = {
        receiverEmail: result.email,
        verifyLink: verificationLink,
        template: 'verifyEmail',
      };

      await this.authService.publishDirectMessage(JSON.stringify(messageDetails));
      const userJWT: string = this.authService.signToken(result.id!, result.email!, result.username!);
      res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default AuthController;
