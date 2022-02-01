<h1 align="center">Blaze Licenses 🔥</h1>

Blaze es un sistema de licencias complejo pero simple de usar, que evitará que las personas usen su software sin su permiso. Esto debería ayudar a la mayoría de desarrolladores que trabajan con software y/o scripts de cualquier tipo.

Con una simple petición **POST** puede saber si el usuario tiene permitido usar el software. Todo esto se maneja desde un bot de Discord con la capacidad de crear licencias, editarlas, eliminarlas y muchas otras cosas.

## Translations 🌐

This README is also available in other languages:

- [Español](https://github.com/DevJhoan/BlazeLicenses/blob/master/README.md) (Spanish)
- [English](https://github.com/DevJhoan/BlazeLicenses/blob/master/README_EN.md) (English)

## Características 🔥

Aquí están algunas de las características de este sistema.

1. **Manejar Licencias**    
Tiene la capacidad de crear, editar, eliminar, listar y obtener información sobre una licencia en específico.

2. **Manejar Productos**    
Tiene la capacidad de crear, editar, eliminar, listar y obtener información sobre un producto en específico.

3. **Manejar Usuarios**     
Te permite crear, editar y listar los usuarios que pueden manejar las licencias y/o los productos, así como también generar api keys para ellos.

4. **Obtener mis licencias**    
El cliente puede obtener sus licencias con un simple comando `/self licenses` si dicho usuario cuenta con una o más licencias asociadas a su cuenta de Discord se mostrarán en una lista.

5. **Api Keys**     
Te permite generar una api key para un usuario con el rol `Administrator` dicha api key se usa para validar la información de las peticiones.

## Dependencias 🔗

- VPS (Ubuntu, Debian, CentOS) 🐧
- Domain Name 🌐 (optional)
- NodeJS V16+ 🛠
- Discord Bot 🤖
- MongoDB 🥭

## Instalación 📦

Para instalar el sistema, se debe tener un vps con los requerimientos de arriba. (si no cuentas con una base de datos mongodb, puedes crear una gratis en [Mongo Atlas](https://www.mongodb.com/cloud/atlas).)

Asegúrese de tener instalado **NodeJS v16+**.

```sh
git clone git@github.com:devjhoan/blazelicenses.git
cd blazelicenses
npm install
npm start
```

## Usuarios? Roles? 🤔

**Si no entiendes el sistema de los roles/usuarios te lo voy a explicar a continuación.**

Los usuarios que se pueden crear desde el bot de Discord, son usuarios con permisos para manejar el sistema de licencias.

- **Role Administrador**   
Los usuarios con este rol pueden manejar las licencias, productos, usuarios y api keys.

- **Role Moderador**    
Los usuarios con este rol solo tienen permitido manejar las licencias (crear, editar, eliminar, listar y obtener información sobre una licencia en específico).

## To-Do 🚧

- Sistema de cache para las licencias, productos, api keys y usuarios.

## Show your support 💙

Give a ⭐️ if this project helped you!

## Licencia  📄
**Blaze Licenses** esta licenciado bajo la [MIT License](https://github.com/DevJhoan/BlazeLicenses/blob/master/LICENSE)

This is not an official Discord product. It is not affiliated with nor endorsed by Discord Inc.

© 2022 - Jhoan M.