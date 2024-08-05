import gql from "graphql-tag";

const firebaseAuthShopApiExtensions = gql`
  type CachedSessionUserResponse {
    id: ID
    identifier: String
    verified: Boolean
  }

  type AuthenticatedSessionResponse {
    cacheExpiry: Int
    id: ID
    token: String
    expires: DateTime
    activeOrderId: ID
    authenticationStrategy: String
    activeChannelId: ID
    user: CachedSessionUserResponse
  }
  extend type Query {
    getSession: AuthenticatedSessionResponse
  }
`;
export const shopApiExtensions = gql`
  ${firebaseAuthShopApiExtensions}
`;
