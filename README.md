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

3. **Obtener mis licencias**    
El cliente puede obtener sus licencias con un simple comando `/self licenses` si dicho usuario cuenta con una o más licencias asociadas a su cuenta de Discord se mostrarán en una lista.

4. **Api Keys**     
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
Recuerde cambiar el nombre del archivo `config.example.yml` a `config.yml`

```sh
git clone git@github.com:devjhoan/blazelicenses.git
cd blazelicenses
npm install
npm start
```

## ¿Cómo hago las solicitudes? 🤖
He hecho un archivo con varios ejemplos de cómo usar el sistema de licencias en varios lenguajes de programación
Aquí está el enlace al documento [Cómo usar?](https://github.com/DevJhoan/BlazeLicenses/blob/master/HOW_USE_ES.MD)

## To-Do 🚧
- [ ] Sistema de cache para las licencias, productos, api keys y usuarios.
- [ ] Agregar una opción para poder poner una fecha maxima a una licencia.
- [x] Agregar soporte para hwid.

## Soporte? 💁🏻
Si no entiendes algo y/o quieres preguntar algo sobre el sistema de licencias, puedes entrar a nuestro [Discord](https://strider.cloud/discord)

## Muestra tu apoyo 💙

¡Dale un ⭐️ si este proyecto te ayudó!

## Licencia  📄
**Blaze Licenses** esta licenciado bajo la [MIT License](https://github.com/DevJhoan/BlazeLicenses/blob/master/LICENSE)

Este no es un producto oficial de Discord. No está afiliado ni respaldado por Discord Inc.

© 2022 - Jhoan M.
