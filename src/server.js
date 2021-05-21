const express = require("express");
const GNrequest = require("./apis/gerenciaNet");

const app = express();
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", "src/views");

const reqGNalready = GNrequest();

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

app.listen(3333, () => {
  console.log("server is running on PORT 3333");
});
