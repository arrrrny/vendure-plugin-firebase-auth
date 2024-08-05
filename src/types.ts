import { CachedSessionUser } from "@vendure/core";

/**
 * @description
 * The plugin can be configured using the following options:
 */
export interface FirebaseAuthOptions {
  serviceAccount: string;
  databaseURL: string;
  registerCustomer: boolean;
  registerUser: boolean;
}

export type AuthenticatedSessionResponse = {
  cacheExpiry?: number;
  id?: string;
  token?: string;
  expires?: Date;
  activeOrderId?: number | string;
  authenticationStrategy?: string;
  activeChannelId?: number | string;
  user?: CachedSessionUser;
};
