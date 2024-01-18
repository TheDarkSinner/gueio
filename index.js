const ethers = require("ethers");
const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");

require("dotenv").config();

const privateKey = process.env.privatekey;
const rpc = process.env.ethRPC;

const provider = new ethers.WebSocketProvider(rpc);

const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0xC15E201DEc8b5757F8B7cf9A5cB167C006DeC602";

const walletAddress = "0x19B8619AE2c613874FB1EE9d5A421A1bA23b4EF3";

const nftContract = new ethers.Contract(contractAddress, ["function batch0Mint()"], wallet);

const wait = async function () {
  let status = true;
  while (status) {
    const filter = {
      address: contractAddress,
    };

    const method = await provider.once(filter, (tx) => tx.data);

    if (method === "0x36a5a8b3") {
      console.log("Mintando...");
      status = false;
      await buy();
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

const buy = async function () {
  try {
    const params = [];

    console.log("Saldo da carteira:", ethers.formatEther(await provider.getBalance(walletAddress)));

    const nonce = await provider.getTransactionCount(walletAddress);

    const tx = await nftContract.batch0Mint({
      gasPrice: ethers.parseUnits("505", "gwei"),
      nonce: nonce,
      value: ethers.parseUnits("16", "ether"),
    });

    await tx.wait();
    console.log("Transação concluída com sucesso:", tx.hash);
    console.log("Novo saldo da carteira:", ethers.formatEther(await provider.getBalance(walletAddress)));
  } catch (error) {
    console.error("Erro ao realizar a transação! >>>", error.shortMessage);
    const rl = readline.createInterface({ input, output });

    rl.question("Digite 1 para aguardar ou 2 para tentar de novo: ", (answer) => {
      if (answer == 1) {
        wait();
      } else {
        buy();
      }

      rl.close();
    });
  }
  return;
};

async function start() {
  console.log("Iniciando...");
  await buy();
}

start();
