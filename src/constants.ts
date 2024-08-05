import { PermissionDefinition } from "@vendure/core";

export const FIREBASE_AUTH_PLUGIN_OPTIONS = Symbol(
  "FIREBASE_AUTH_PLUGIN_OPTIONS",
);
export const loggerCtx = "FirebaseAuthPlugin";
export const firebaseUser = new PermissionDefinition({
  name: "FirebaseUser",
  description: "Firebase User",
});
