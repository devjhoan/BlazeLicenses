## Blaze 

Con una simple petición **POST** puede saber si el usuario tiene permitido usar el software. Todo esto se maneja desde un bot de Discord con la capacidad de crear licencias, editarlas, eliminarlas y muchas otras cosas.

## Como debo hacerla?

Debe enviar los siguientes datos como un json:

```json
{
    "licensekey" : "HIX72-QJCGU-CV4ZE-IIYI4-5NACW",
    "product" : "Absolet",
    "version" : "1.0.7"
}
```

También debe enviar en la cabecera la api key que usted definio en la configuración del bot.

## Ejemplos

### Javascript
```javascript
const axios = require('axios')

try {
    const url = 'http://SERVER_IP/api/client';
	const licensekey = "LICENSE_KEY"; // get from a config file
	const product = 'PRODUCT_NAME';
	const version = 'VERSION';
	const api_key = 'API_KEY';

    const res = await axios.post(
   		url,
   		{
   		    licensekey,
   		    product,
   		    version,
   		},
   		{ headers: { Authorization: api_key }}
	);

   	if (!res.data.status_code || !res.data.status_id){
		console.log(" |- Your license is invalid.")
		console.log("-------------------------------------------------");
   	    return process.exit(1)
   	}

    if(res.data.status_overview !== "success"){
		console.log(" |- Your license is invalid.")
		console.log(" ")
		console.log(" |- Reason: " + res.data.status_msg);
		console.log(" |- Status Code: \x1b[31m" + res.data.status_code + "\x1b[0m");
		console.log("-------------------------------------------------");
   		return process.exit(1);
   	} else {
        console.log(` |- License has been validated. [${res.data.clientname || '\x1b[31mUnknown\x1b[0m'}]`);
	    console.log(" ")
	    console.log(" |- Discord ID: " + res.data.discord_id);
	    console.log(" |- Status Code: \x1b[32m" + res.data.status_code + "\x1b[0m");
	    console.log(` |- Version: \x1b[33m${version}\x1b[0m/\x1b[32m${res.data.version}\x1b[0m`);
        console.log("-------------------------------------------------");
    }
} catch (err) {
    console.log("Authentication failed")
    console.log(error)
    process.exit(1)
}
```
