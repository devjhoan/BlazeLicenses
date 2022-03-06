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
    const hwid = 'PC_IDENTIFIER';

    const res = await axios.post(
   		url,
   		{
   		    licensekey,
   		    product,
   		    version,
            hwid
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

### Java

## Libs
```xml
    </dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.22</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.httpcomponents</groupId>
            <artifactId>httpclient</artifactId>
            <version>4.3.2</version>
        </dependency>
        <dependency>
            <groupId>org.json</groupId>
            <artifactId>json</artifactId>
            <version>20210307</version>
        </dependency>
    </dependencies>
```

```java
/*
   * Author: _xDani_
   * Date: 04/03/2022
   * For BlazeLicenses
*/

@RequiredArgsConstructor
@Getter
public class License {

    private final URI host;
    private final String licenseKey;
    private final String product;
    private final String version;
    private final String apiKey;
    private final String hwid;

    private int statusCode;
    private String discordName;
    private String discordID;
    private String statusMsg;

    public boolean check() {
        HttpPost post = new HttpPost(host);

        // add request parameter, form parameters
        List<NameValuePair> urlParameters = new ArrayList<>();
        urlParameters.add(new BasicNameValuePair("licensekey", licenseKey));
        urlParameters.add(new BasicNameValuePair("product", product));
        urlParameters.add(new BasicNameValuePair("version", version));
        urlParameters.add(new BasicNameValuePair("hwid", hwid));

        try {
            post.setEntity(new UrlEncodedFormEntity(urlParameters));
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }

        post.setHeader("Authorization", apiKey);

        try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(post)) {
            String data = EntityUtils.toString(response.getEntity());
            JSONObject obj = new JSONObject(data);
            if(!obj.has("status_msg") || !obj.has("status_id")) {
                return false;
            }

            statusCode = obj.getInt("status_code");
            statusMsg = obj.getString("status_msg");

            if(obj.getString("status_overview") == null){
                return false;
            }

            discordName = obj.getString("clientname"); // You can set discord_username too!
            discordID = obj.getString("discord_id");

            return true;

        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }
}

```
