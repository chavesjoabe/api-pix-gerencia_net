if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const cert = fs.readFileSync(
  path.resolve(__dirname, `../certs/${process.env.GN_CERT}`)
);

const agent = new https.Agent({
  pfx: cert,
  passphrase: "",
});

const credentials = Buffer.from(
  `${process.env.GN_CLIENT_ID}:${process.env.GN_CLIENT_SECRET}`
).toString("base64");

axios({
  method: "POST",
  url: `${process.env.GN_ENDPOINT}/oauth/token`,
  headers: {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  },
  httpsAgent: agent,
  data: {
    grant_type: "client_credentials",
  },
}).then((response) => console.log(response.data));

/* curl --location --request POST 'https://api-pix-h.gerencianet.com.br/oauth/token' \
--header 'x-client-cert-pem: {{X-Certificate-Pem}}' \
--header 'Authorization: Basic Q2xpZW50X0lkXzE2YTYyM2FiM2VhODc5MTJhYjZkZjFjMWEwNzVkNzMyOGQyNDI0OGY6Q2xpZW50X1NlY3JldF9kNGI4MmY0MWU2ZDg3MGQzYTdiNjdlYTQxMTQ1ZGU4MWYyNDUxZjUy' \
--header 'Content-Type: application/json' \
--data-raw '{
    "grant_type": "client_credentials"
}' */
