import { 
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GlobalSignOutCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig } from '@/lib/aws-config';
import * as CryptoJS from 'crypto-js';

export class AuthService {
  private static client = new CognitoIdentityProviderClient(awsConfig);
  private static CLIENT_ID = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID;
  private static CLIENT_SECRET = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_SECRET;

  static async register({
      email,
      password,
      phone,
      firstName,
      lastName,
      address,
      birthdate,
      gender
  }) {
      if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
          throw new Error('Client ID or Client Secret is not defined');
      }

      try {
          const secretHash = this.calculateSecretHash(email, this.CLIENT_ID, this.CLIENT_SECRET);

          const command = new SignUpCommand({
              ClientId: this.CLIENT_ID,
              Username: email,
              Password: password,
              SecretHash: secretHash,
              UserAttributes: [
                  { Name: 'name', Value: `${firstName} ${lastName}` },
                  { Name: 'phone_number', Value: phone },
                  { Name: 'given_name', Value: firstName },
                  { Name: 'family_name', Value: lastName },
                  { Name: 'address', Value: address },
                  { Name: 'birthdate', Value: birthdate },
                  { Name: 'gender', Value: gender }
              ]
          });

          const response = await this.client.send(command);
          return { 
              data: response, 
              error: null 
          };
      } catch (error) {
          console.error('Error en registro:', error);
          return { 
              data: null, 
              error 
          };
      }
  }

  static async confirmSignUp(email, code) {
      try {
          const command = new ConfirmSignUpCommand({
              ClientId: this.CLIENT_ID,
              Username: email,
              ConfirmationCode: code
          });

          const response = await this.client.send(command);
          return { 
              data: response, 
              error: null 
          };
      } catch (error) {
          console.error('Error confirming signup:', error);
          return { 
              data: null, 
              error 
          };
      }
  }

  static async resendConfirmationCode(email) {
      try {
          const command = new ResendConfirmationCodeCommand({
              ClientId: this.CLIENT_ID,
              Username: email
          });

          const response = await this.client.send(command);
          return { 
              data: response, 
              error: null 
          };
      } catch (error) {
          console.error('Error resending confirmation code:', error);
          return { 
              data: null, 
              error 
          };
      }
  }

  static async login({ email, password }) {
      try {
          const command = new InitiateAuthCommand({
              AuthFlow: 'USER_PASSWORD_AUTH',
              ClientId: this.CLIENT_ID,
              AuthParameters: {
                  USERNAME: email,
                  PASSWORD: password
              }
          });

          const response = await this.client.send(command);
          
          if (response.AuthenticationResult) {
              document.cookie = `accessToken=${response.AuthenticationResult.AccessToken}; path=/; max-age=3600; SameSite=Strict; Secure`;
              document.cookie = `idToken=${response.AuthenticationResult.IdToken}; path=/; max-age=86400; SameSite=Strict; Secure`;
              document.cookie = `refreshToken=${response.AuthenticationResult.RefreshToken}; path=/; max-age=2592000; SameSite=Strict; Secure`;
          }
          
          return { 
              data: response, 
              error: null 
          };
      } catch (error) {
          console.error('Error en login:', error);
          return { 
              data: null, 
              error 
          };
      }
  }

  static async logout() {
      try {
          const accessToken = this.getAccessToken();
          
          if (accessToken) {
              const command = new GlobalSignOutCommand({
                  AccessToken: accessToken
              });
              
              await this.client.send(command);
          }
          
          document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict; Secure';
          document.cookie = 'idToken=; path=/; max-age=0; SameSite=Strict; Secure';
          document.cookie = 'refreshToken=; path=/; max-age=0; SameSite=Strict; Secure';
          
          return { success: true };
      } catch (error) {
          console.error('Error en logout:', error);
          return { success: false, error };
      }
  }

  static async forgotPassword(email) {
      try {
          const command = new ForgotPasswordCommand({
              ClientId: this.CLIENT_ID,
              Username: email
          });

          const response = await this.client.send(command);
          return { 
              data: response, 
              error: null 
          };
      } catch (error) {
          console.error('Error in forgot password:', error);
          return { 
              data: null, 
              error 
          };
      }
  }

  static async confirmForgotPassword(email, code, newPassword) {
      try {
          const command = new ConfirmForgotPasswordCommand({
              ClientId: this.CLIENT_ID,
              Username: email,
              ConfirmationCode: code,
              Password: newPassword
          });

          const response = await this.client.send(command);
          return { 
              data: response, 
              error: null 
          };
      } catch (error) {
          console.error('Error confirming forgot password:', error);
          return { 
              data: null, 
              error 
          };
      }
  }

  static async getCurrentUser() {
      const idToken = this.getIdToken();
      if (!idToken) return null;
      
      try {
          const payload = JSON.parse(atob(idToken.split('.')[1]));
          return {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              firstName: payload.given_name,
              lastName: payload.family_name,
              phone: payload.phone_number,
              emailVerified: payload.email_verified === 'true',
              phoneVerified: payload.phone_number_verified === 'true'
          };
      } catch (error) {
          console.error('Error parsing token:', error);
          return null;
      }
  }

  private static getAccessToken() {
      const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
      return match ? match[2] : null;
  }

  private static getIdToken() {
      const match = document.cookie.match(new RegExp('(^| )idToken=([^;]+)'));
      return match ? match[2] : null;
  }

  private static calculateSecretHash(username: string, clientId: string, clientSecret: string): string {
      const hmac = CryptoJS.HmacSHA256(username + clientId, clientSecret);
      return CryptoJS.enc.Base64.stringify(hmac);
  }
}