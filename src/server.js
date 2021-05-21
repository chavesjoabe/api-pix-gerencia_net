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
}).then((response) => {
  const accessToken = response.data?.access_token;

  const reqGN = axios.create({
    baseURL: process.env.GN_ENDPOINT,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const dataCob = {
    calendario: {
      expiracao: 3600,
    },
    devedor: {
      cpf: "12345678909",
      nome: "Francisco da Silva",
    },
    valor: {
      original: "100.00",
    },
    chave: "chavesjoabe1@gmail.com",
    solicitacaoPagador: "Informe o número ou identificador do pedido.",
  };

  reqGN.post("v2/cob", dataCob).then((cob) => console.log(cob.data));
});

/* curl --location --request POST 'https://api-pix-h.gerencianet.com.br/oauth/token' \
--header 'x-client-cert-pem: {{X-Certificate-Pem}}' \
--header 'Authorization: Basic Q2xpZW50X0lkXzE2YTYyM2FiM2VhODc5MTJhYjZkZjFjMWEwNzVkNzMyOGQyNDI0OGY6Q2xpZW50X1NlY3JldF9kNGI4MmY0MWU2ZDg3MGQzYTdiNjdlYTQxMTQ1ZGU4MWYyNDUxZjUy' \
--header 'Content-Type: application/json' \
--data-raw '{
    "grant_type": "client_credentials"
}' */
