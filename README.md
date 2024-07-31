### `README.md`

```md
# Vendure Plugin Firebase Auth for Shop-API

This package is a Vendure plugin that allows authentication using Firebase Auth.

## Installation

```sh
npm install vendure-plugin-firebase-auth
```
Download the google-service.json file from Firebase and save it in the root of your project.
in your environment variables, add the following:

FIREBASE_SERVICE_ACCOUNT=google-service.json
FIREBASE_DATABASE_URL=https://<project-id>.firebaseio.com

## Configuration

In your Vendure config, import and use the `FirebaseAuthPlugin`.

```ts
import { FirebaseAuthPlugin } from "vendure-plugin-firebase-auth";

const config = {
  plugins: [
    FirebaseAuthPlugin.init({
      serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      allowNewUserRegistration: true,
    }),
    // other plugins...
  ],
};
```

## Options

The `FirebaseAuthPlugin` accepts the following options:

- `serviceAccount`: The service account object for Firebase.
- `databaseURL`: The Firebase database URL.
- `allowNewUserRegistration`: A boolean to allow new user registrations.Creates a new user in the Vendure database if the user does not exist.


## Usage

After setting up the plugin, you can use the `authenticate` mutation to authenticate a user using Firebase Auth.

```graphql
mutation{
  authenticate(input:{
    firebase:{
      jwt:"eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkYmUwNmI1ZDdjMmE3YzA0NDU2MzA2MWZmMGZlYTM3NzQwYjg2YmMiLCJ0eXAiOiJKV1QifQ.eyJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS96aWt6YWt6aWt6YWt3dGYiLCJhdWQiOiJ6aWt6YWt6aWt6YWt3dGYiLCJhdXRoX3RpbWUiOjE3MjI0MzYyMTcsInVzZXJfaWQiOiJlTVROUGtkR283VnowNE9nQmRNTEhDTjhmQUcyIiwic3ViIjoiZU1UTlBrZEdvN1Z6MDRPZ0JkTUxIQ044ZkFHMiIsImlhdCI6MTcyMjQzNjIxNywiZXhwIjoxNzIyNDM5ODE3LCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImFub255bW91cyJ9fQ.sumcW-_NnWCsX_l7i17TfOA5MC-b30JbYhEysAwX6p7J_ljPXIMDNQPLmoCbu75srLWqzMhpfIoCYyctEVFSYFsRyJnRUt5pjOAAE86LuAam_9-8iWraQUQgtIjG09PGOe5d4BoKhMP6R9e06A6K74Sg98lda8QwVYWxHUD9lrvBglO3y5r-LC-hnqhLXx3GO4f9lmhoBCxQ4AuZ-gp4-5JUQwtmbxRZdCQT4tWm5T4-flLvFP_Vbjhy369KIH9aMNgpuFXM2g88Qfxu277Lb7gwv4ObjZu6MeUEMpLQo49S0Jfx64lTwmDJmuqUvxiD_Ck0yvY9n_123456789OQPR",
      uid:"eMTNPkdGo7Vz04OgBdMLHXXXXXXX"
    }
  }){
    __typename
  }
}
```
## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/arrrrny/vendure-plugin-firebase-auth).
