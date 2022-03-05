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

3. **Get my licenses**    
The client can get their licenses with a simple `/self licenses` command if that user has one or more licenses associated with their Discord account they will be listed.

4. **Api Keys**     
It allows you to configure an api key to be able to make requests to the api.

## Dependencies 🔗

- VPS (Ubuntu, Debian, CentOS) 🐧
- Domain Name 🌐 (optional)
- NodeJS V16+ 🛠
- Discord Bot 🤖
- MongoDB 🥭

## Installation 📦

To install the system, you must have a vps with the above requirements. (If you don't have a mongodb database, you can create one for free in [Mongo Atlas](https://www.mongodb.com/cloud/atlas).)

Make sure you have **NodeJS v16+** installed.
Remember to rename the file `config.example.yml` to `config.yml`

```sh
git clone git@github.com:devjhoan/blazelicenses.git
cd blazelicenses
npm install
npm start
```

## How do I make requests? 🤖
I have made a file with several examples of how to use the license system in various programming languages
Here is the link to the document [How to use?](https://github.com/DevJhoan/BlazeLicenses/blob/master/HOW_USE_EN.MD)

## To-Do 🚧

- [ ] Cache system for licenses, products, api keys and users.
- [ ] Add an option to be able to put a maximum date on a license.
- [x] Add support for hwid.

## Support? 💁🏻
If you don't understand something and/or want to ask something about the licensing system, you can enter our [Discord](https://strider.cloud)

## Show your support 💙

Give a ⭐️ if this project helped you!

## License  📄
**Blaze Licenses** is licensed under the [MIT License](https://github.com/DevJhoan/BlazeLicenses/blob/master/LICENSE)

This is not an official Discord product. It is not affiliated with nor endorsed by Discord Inc.

© 2022 - Jhoan M.
