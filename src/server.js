const express = require("express");
const GNrequest = require("./apis/gerenciaNet");

const app = express();
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "src/views");

const reqGNalready = GNrequest({
  clientId: process.env.GN_CLIENT_ID,
  clientSecret: process.env.GN_CLIENT_SECRET,
});

app.get("/", async (req, res) => {
  const reqGN = await reqGNalready;
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

app.get("/cobrancas", async (req, res) => {
  const reqGN = await reqGNalready;

  const cobResponse = await reqGN.get(
    "/v2/cob?inicio=2021-05-20T16:01:35Z&fim=2021-12-30T20:10:00Z"
  );
  res.send(cobResponse.data);
});

app.listen(3333, () => {
  console.log("server is running on PORT 3333");
});
