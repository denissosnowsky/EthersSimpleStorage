import { Wallet, ContractFactory, providers } from "ethers";
import fs from "fs";
import "dotenv/config";

async function main() {
  const provider = new providers.JsonRpcProvider(process.env.RPC_URL);
  //const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
  const encryptedJson = fs.readFileSync('./.encryptedKey.json', 'utf-8');
  let wallet = Wallet.fromEncryptedJsonSync(encryptedJson, process.env.PRIVATE_KEY_PASSWORD!);
  wallet = await wallet.connect(provider);

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  );

  const contractFactory = new ContractFactory(abi, binary, wallet);
  console.log("Deploying...");
  const contract = await contractFactory.deploy();
  await contract.deployTransaction.wait(1);
  console.log(contract.address);

  const currentFavoriteNumber = await contract.retrieve();
  console.log(`Current favorite number: ${currentFavoriteNumber.toString()}`);

  const txResponse = await contract.store("7");
  const txReceipt = await txResponse.wait(1);
  const updatedFavoriteNumber = await contract.retrieve();
  console.log(`Updated favorite number: ${updatedFavoriteNumber}`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
