# Introduction

Automated validation tests for EBU-LIST based on [ebu-list-sdk](https://github.com/bisect-pt/ebu-list-sdk):

-   basics: authentication, pcap upload, analysis validation, download
-   read-only demo account deployment

# Getting Started

1. Software dependencies

-   `yarn`
-   `npm`

2. Installation process

```sh
git submodule update --init --recursive
yarn install
```

3. Build

```sh
npx lerna bootstrap
npx lerna run build
```

4. Test

```sh
cd packages/tests
yarn run validation-tests -b http://<server_@> -u <user> -p <pwd>
```

-   u - The username from the demo user that you want to create.

-   p - The password from the demo user that you want to create.

Example:

-   `yarn run read-only-user -b http://localhost -u userdemo -p userdemo`

The default values from "u" and "p" arguments are both "listtest".

5. User read-only

```sh
cd packages/user-read-only
yarn run user-read-only -b http://<server_@> -u <user> -p <pwd>
```

-   u - The username from the demo user that you want to create.

-   p - The password from the demo user that you want to create.

Example:

-   `yarn run read-only-user -b http://localhost -u userdemo -p userdemo`

The default values from "u" and "p" arguments are both "user".

# Latest releases

# API references

# Contribute

TODO: 1st decide if this is supposed to be public
TODO: Explain how other users and developers can contribute to make your code better.

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:

-   [ASP.NET Core](https://github.com/aspnet/Home)
-   [Visual Studio Code](https://github.com/Microsoft/vscode)
-   [Chakra Core](https://github.com/Microsoft/ChakraCore)
