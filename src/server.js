if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");

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

const app = express();
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "src/views");

app.get("/", async (req, res) => {
  //cria um token oAuth
  const authResponse = await axios({
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
  });

  const accessToken = authResponse.data?.access_token;
  //criando uma instancia do axios com os headers padroes
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
  //cria uma cobrança
  const cobResponse = await reqGN.post("v2/cob", dataCob);
  //cria um qrcode com os dados da cobrança
  const qrCodeResponse = await reqGN.get(
    `/v2/loc/${cobResponse.data.loc.id}/qrcode`
  );
  //renderiza o ejs com o qrcode gerado
  res.render("qrcode", { qrcodeImage: qrCodeResponse.data.imagemQrcode });
});

app.listen(3333, () => {
  console.log("server is running on PORT 3333");
});
