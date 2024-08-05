import { Inject } from "@nestjs/common";
import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";

import {
  Allow,
  Ctx,
  ErrorResult,
  ExternalAuthenticationService,
  ID,
  Logger,
  Order,
  OrderService,
  RequestContext,
  SessionService,
  Transaction,
  UserInputError,
  UserService,
  idsAreEqual,
} from "@vendure/core";
import { InvalidCredentialsError } from "@vendure/core/dist/common/error/generated-graphql-shop-errors";
import { AuthenticatedSessionResponse } from "../types";

// declare module "@vendure/core/dist/entity/custom-entity-fields" {
//   interface CustomOrderFields {
//     userExternalIdentifier: string;
//     userAuthMethod: string;
//   }
// }
//
const loggerCtx = "FirebaseAuthStrategy";

@Resolver()
export class ExternalAuthSessionResover {
  constructor(
    private sessionService: SessionService,
    private externalAuthenticationService: ExternalAuthenticationService,
  ) {}

  @Query()
  // @Allow(Permission.Authenticated, Permission.Owner)
  async getSession(
    @Ctx() ctx: RequestContext,
  ): Promise<AuthenticatedSessionResponse> {

    try {
      console.log(ctx.session?.token);
      if (ctx.session?.token == null) {
        throw new InvalidCredentialsError({
          authenticationError: "No valid token found",
        });
      }

      Logger.info("Getting session from token");
      const session = await this.sessionService.getSessionFromToken(ctx.session?.token);
      console.log(session);
      if (session == null) {
        throw new InvalidCredentialsError({
          authenticationError: "No valid session found",
        });
      }
      return {
        expires: session.expires,
        user: session.user,
        cacheExpiry: session.cacheExpiry,
        activeOrderId: session.activeOrderId,
        activeChannelId: session.activeChannelId,
      };
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(
          `Error authenticating with Firebase login: ${error.message}`,
          loggerCtx,
        );
      }else if (error instanceof ErrorResult){
        // return error;
      }
      console.log(error);
      throw error;
    }
  }
}
