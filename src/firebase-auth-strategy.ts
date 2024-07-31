import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";

import {
  AuthenticationStrategy,
  ExternalAuthenticationMethod,
  Injector,
  RequestContext,
  TransactionalConnection,
  Logger,
  User,
  ExternalAuthenticationService,
} from "@vendure/core";
import * as admin from "firebase-admin";
import { FirebaseAuthOptions } from "./types";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import { DecodedIdToken } from "firebase-admin/auth";
import { FIREBASE_AUTH_PLUGIN_OPTIONS } from "./constants";

export interface FirebaseAuthData {
  jwt: string;
  uid: string;
}
export declare const FIREBASE_AUTH_STRATEGY_NAME = "firebase";

const loggerCtx = "FirebaseAuthStrategy";

export class FirebaseAuthStrategy
  implements AuthenticationStrategy<FirebaseAuthData>
{
  private connection: TransactionalConnection;
  private options: FirebaseAuthOptions;
  readonly name = "firebase";
  private externalAuthenticationService: ExternalAuthenticationService;

  constructor() {}
  defineInputType(): DocumentNode {
    return gql`
      input FirebaseAuthInput {
        """
        The encoded response credential and uid returned by the FirebaseAuth API
        """
        jwt: String!
        uid: String!
      }
    `;
  }

  async authenticate(
    ctx: RequestContext,
    data: FirebaseAuthData,
  ): Promise<string | false | User> {
    try {
      const decodedIdToken: DecodedIdToken = await admin
        .auth()
        .verifyIdToken(data.jwt);
      if (decodedIdToken.uid == data.uid) {
        const user = await this.externalAuthenticationService.findUser(
          ctx,
          this.name,
          decodedIdToken.uid,
        );
        // const user = await this.connection.getRepository(ctx, User).findOne({
        //   where: {
        //     identifier: decodedIdToken.uid,
        //   },
        // });
        if (user != null) {
          return user;
        } else {
          if (decodedIdToken.email != null && this.options.registerCustomer) {
            return await this.externalAuthenticationService.createCustomerAndUser(
              ctx,
              {
                strategy: this.name,
                externalIdentifier: decodedIdToken.uid,
                verified: decodedIdToken.email_verified || false,
                emailAddress: decodedIdToken.email,
              },
            );
          }
          if (this.options.registerUser) {
            const newUser = new User();
            newUser.identifier = decodedIdToken.uid;
            newUser.verified = false;
            const firebaseAuthMethod = await this.connection!.getRepository(
              ctx,
              ExternalAuthenticationMethod,
            ).save(
              new ExternalAuthenticationMethod({
                strategy: this.name,
                externalIdentifier: decodedIdToken.uid,
              }),
            );
            newUser.authenticationMethods = [firebaseAuthMethod];
            return await this.connection.getRepository(ctx, User).save(newUser);
          }
        }
        return false;
      } else {
        throw new Error("Invalid User Id");
      }
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(
          `Error authenticating with Firebase login: ${error.message}`,
          loggerCtx,
          error.stack,
        );
      } else {
        Logger.error(
          `Unknown error authenticating with Firebase login: ${String(error)}`,
          loggerCtx,
        );
      }
      return false;
    }
  }
  // onLogOut?(ctx: RequestContext, user: User): Promise<void> {
  //   throw new Error("Method not implemented.");
  // }

  init(injector: Injector) {
    this.externalAuthenticationService = injector.get(
      ExternalAuthenticationService,
    );

    this.connection = injector.get(TransactionalConnection);
    this.options = injector.get(FIREBASE_AUTH_PLUGIN_OPTIONS);

    if (!admin.apps.length) {
      if (this.options.serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(this.options.serviceAccount),
          databaseURL: this.options.databaseURL,
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      }
    }
  }
  destroy() {
    if (admin.apps.length > 0) admin.app().delete();
  }
}
