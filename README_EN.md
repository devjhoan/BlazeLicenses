<h1 align="center">Blaze Licenses 🔥</h1>

Blaze is a complex yet simple to use licensing system that will prevent people from using your software without your permission. This should help most developers working with software and/or scripts of any kind.

With a simple **POST** request you can find out if the user is allowed to use the software. All of this is handled from a Discord bot with the ability to create licenses, edit them, delete them, and many other things.

## Translations 🌐

This README is also available in other languages:

- [Español](https://github.com/DevJhoan/BlazeLicenses/blob/master/README.md) (Spanish)
- [English](https://github.com/DevJhoan/BlazeLicenses/blob/master/README_EN.md) (English)

## Features 🔥

Here are some of the features of this system.

1. **Manage Licenses**    
It has the ability to create, edit, delete, list and get information about a specific license.

2. **Manage Products**    
It has the ability to create, edit, delete, list and obtain information about a specific product.

3. **Manage Users**     
It allows you to create, edit and list the users that can manage the licenses and/or products, as well as generate api keys for them.

4. **Get my licenses**    
The client can get their licenses with a simple `/self licenses` command if that user has one or more licenses associated with their Discord account they will be listed.

5. **Api Keys**     
It allows you to generate an api key for a user with the role `Administrator` said api key is used to validate the information of the requests.

## Dependencies 🔗

- VPS (Ubuntu, Debian, CentOS) 🐧
- Domain Name 🌐 (optional)
- NodeJS V16+ 🛠
- Discord Bot 🤖
- MongoDB 🥭

## Installation 📦

To install the system, you must have a vps with the above requirements. (If you don't have a mongodb database, you can create one for free in [Mongo Atlas](https://www.mongodb.com/cloud/atlas).)

Make sure you have **NodeJS v16+** installed.

```sh
git clone git@github.com:devjhoan/blazelicenses.git
cd blazelicenses
npm install
npm start
```

## Users? Roles? 🤔

**If you do not understand the system of roles/users, I will explain it to you below.**

The users that can be created from the Discord bot are users with permissions to manage the licensing system.

- **Role Administrator**   
Users with this role can manage licenses, products, users and api keys.

- **Role Moderator**    
Users with this role are only allowed to manage licenses (create, edit, delete, list and get information about a specific license).

## To-Do 🚧

- Cache system for licenses, products, api keys and users.

## Show your support 💙

Give a ⭐️ if this project helped you!

## License  📄
**Blaze Licenses** is licensed under the [MIT License](https://github.com/DevJhoan/BlazeLicenses/blob/master/LICENSE)

This is not an official Discord product. It is not affiliated with nor endorsed by Discord Inc.

© 2022 - Jhoan M.