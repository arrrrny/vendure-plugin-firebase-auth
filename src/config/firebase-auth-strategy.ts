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
  extractSessionToken,
  SessionService,
  Role,
  Permission,
  RoleService,
} from "@vendure/core";
import * as admin from "firebase-admin";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import { DecodedIdToken } from "firebase-admin/auth";
import { FirebaseAuthOptions } from "../types";
import { FIREBASE_AUTH_PLUGIN_OPTIONS, firebaseUser } from "../constants";

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
  private sessionService: SessionService;
  private roleService: RoleService;
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

      input FirebaseGetSessionInput {
        token: String!
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

      if (decodedIdToken.uid != data.uid) {
        throw new Error("Invalid User Id");
      }

      const user = await this.externalAuthenticationService.findUser(
        ctx,
        this.name,
        decodedIdToken.uid,
      );

      if (user != null) {
        Logger.info("User found in database. Returning user.");
        return user;
      }
      if (!ctx.channelId) {
        throw new Error("No channel found, cant create a user or customer");
      }
      if (this.options.registerUser || this.options.registerCustomer) {
        const roleRepository = this.connection.getRepository(ctx, Role);
        let firebaseRole = await roleRepository.findOne({
          where: { code: "firebase-user" },
        });
        if (!firebaseRole) {
          firebaseRole = new Role();
          firebaseRole.code = "firebase-user";
          firebaseRole.description = "Firebase User";
          firebaseRole.permissions = [
            Permission.Authenticated,
            firebaseUser.Permission,
          ];

          firebaseRole = await roleRepository.save(firebaseRole);
          await this.roleService.assignRoleToChannel(
            ctx,
            firebaseRole.id,
            ctx.channelId,
          );
          Logger.info(`FirebaseUser role created`, loggerCtx);
        } else {
          Logger.info(`FirebaseUser role already exists`, loggerCtx);
        }
        if (this.options.registerCustomer) {
          const firebaseUser = await admin.auth().getUser(data.uid);

          if (
            firebaseUser.email &&
            firebaseUser.displayName &&
            firebaseUser.displayName.split(" ").length > 1
          ) {
            const newUser =
              await this.externalAuthenticationService.createCustomerAndUser(
                ctx,
                {
                  strategy: this.name,
                  externalIdentifier: decodedIdToken.uid,
                  verified: firebaseUser.emailVerified || false,
                  emailAddress: firebaseUser.email,
                  firstName: firebaseUser.displayName.split(" ")[0],
                  lastName: firebaseUser.displayName.split(" ")[1],
                },
              );
            newUser.roles.push(firebaseRole);
            return await this.connection.getRepository(ctx, User).save(newUser);
          }
        }
        if (this.options.registerUser) {
          const newUser = new User();

          newUser.identifier = decodedIdToken.uid;
          const firebaseAuthMethod = await this.connection!.getRepository(
            ctx,
            ExternalAuthenticationMethod,
          ).save(
            new ExternalAuthenticationMethod({
              strategy: this.name,
              externalIdentifier: decodedIdToken.uid,
            }),
          );
          newUser.roles = [firebaseRole];
          newUser.authenticationMethods = [firebaseAuthMethod];
          return await this.connection.getRepository(ctx, User).save(newUser);
        }
      }
      return false;
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

  async getSession(ctx: RequestContext, token: string) {
    try {
      Logger.info("Getting session from token");
      return this.sessionService.getSessionFromToken(token);
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

  init(injector: Injector) {
    this.externalAuthenticationService = injector.get(
      ExternalAuthenticationService,
    );
    this.roleService = injector.get(RoleService);
    this.sessionService = injector.get(SessionService);
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
