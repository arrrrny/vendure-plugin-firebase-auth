##0.3.3
Added compability with Vendure 3.0.0

## 0.3.2
### Features
- Created FirebaseUser Role in Vendure and automatically assign the
newly created user to the FirebaseUser role.This role has Permission.Authenticated
and FirebaseUser.Permission which ca be used to restrict access to certain resources.

## 0.2.0
### Features
- Added new method `getSession` to get session of the currently authenticated user,
to be able to decide if the user needs to get a new token before sending a request,
which will keep the active order open for the user.

# 0.1.4
- registerCustomer: true, //if email is present, create customer in Vendure
- registerUser: true, //create user in Vendure without email
# 0.1.3
- If user email is present, added support to create customer

# 0.1.1

- Initial release
