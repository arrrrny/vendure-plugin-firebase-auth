import { PluginCommonModule, Type, VendurePlugin } from "@vendure/core";

import { FIREBASE_AUTH_PLUGIN_OPTIONS } from "./constants";
import { FirebaseAuthOptions } from "./types";
import { FirebaseAuthStrategy } from "./firebase-auth-strategy";

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    {
      provide: FIREBASE_AUTH_PLUGIN_OPTIONS,
      useFactory: () => FirebaseAuthPlugin.options,
    },
  ],
  configuration: (config) => {
    // Plugin-specific configuration
    // such as custom fields, custom permissions,
    // strategies etc. can be configured here by
    // modifying the `config` object.
    config.authOptions.shopAuthenticationStrategy.push(
      new FirebaseAuthStrategy(),
    );
    return config;
  },
  compatibility: "^2.0.0",
})
export class FirebaseAuthPlugin {
  static options: FirebaseAuthOptions;

  static init(options: FirebaseAuthOptions): Type<FirebaseAuthPlugin> {
    this.options = options;
    return FirebaseAuthPlugin;
  }
}
