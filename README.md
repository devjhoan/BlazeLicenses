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

4. **Obtener mis licencias**    
El cliente puede obtener sus licencias con un simple comando `/self licenses` si dicho usuario cuenta con una o más licencias asociadas a su cuenta de Discord se mostrarán en una lista.

5. **Api Keys**     
Te permite configurar una api key para poder hacer peticiones a la api.

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

## To-Do 🚧

- Sistema de cache para las licencias, productos, api keys y usuarios.

## Muestra tu apoyo 💙

¡Dale un ⭐️ si este proyecto te ayudó!

## Licencia  📄
**Blaze Licenses** esta licenciado bajo la [MIT License](https://github.com/DevJhoan/BlazeLicenses/blob/master/LICENSE)

This is not an official Discord product. It is not affiliated with nor endorsed by Discord Inc.

© 2022 - Jhoan M.
