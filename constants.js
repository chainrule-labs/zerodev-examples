import dotenv from "dotenv";
import { linea, lineaSepolia, sepolia } from "viem/chains";
import { decrypt } from "./crypto.js";

dotenv.config();

// Sepolia
export const SEPOLIA_RPC = process.env.SEPOLIA_RPC;
export const SEPOLIA_PAYMASTER_RPC = process.env.SEPOLIA_PAYMASTER_RPC;
export const SEPOLIA_BUNDLER_RPC = process.env.SEPOLIA_BUNDLER_RPC;
export const SEPOLIA_USDC_CONTRACT =
	"0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// Linea
export const LINEA_RPC = process.env.LINEA_RPC;
export const LINEA_PAYMASTER_RPC = process.env.LINEA_PAYMASTER_RPC;
export const LINEA_BUNDLER_RPC = process.env.LINEA_BUNDLER_RPC;
export const LINEA_USDC_CONTRACT =
// USDC.e works: https://lineascan.build/address/0x176211869cA2b568f2A7D4EE941E073a821EE1ff
// "0x176211869cA2b568f2A7D4EE941E073a821EE1ff";

// axlUSDC fails: https://lineascan.build/address/0xEB466342C4d449BC9f53A865D5Cb90586f405215
"0xEB466342C4d449BC9f53A865D5Cb90586f405215";

// Linea Sepolia
export const LINEA_SEPOLIA_RPC = process.env.LINEA_SEPOLIA_RPC;
export const LINEA_SEPOLIA_PAYMASTER_RPC = process.env.LINEA_SEPOLIA_PAYMASTER_RPC;
export const LINEA_SEPOLIA_BUNDLER_RPC = process.env.LINEA_SEPOLIA_BUNDLER_RPC;
export const LINEA_SEPOLIA_USDC_CONTRACT =
	"0xd9d3d09F9ac57E6325723AA5776eBA1DD7557632";

export const TEST_LOCKER_AGENT_PK = process.env.TEST_LOCKER_AGENT_PK;

export const TEST_LOCKER_AGENT = process.env.TEST_LOCKER_AGENT;

export const TEST_BEAM_ADDRESS = process.env.TEST_BEAM_ADDRESS;

export const TEST_HOT_WALLET = process.env.TEST_HOT_WALLET;

export const UNAUTHORIZED_ADDRESS = process.env.UNAUTHORIZED_ADDRESS;

export const TEST_OWNER = process.env.TEST_OWNER;

export const TEST_OWNER_PK = process.env.TEST_OWNER_PK;

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

export const ZERODEV_INDEX = BigInt(process.env.ZERODEV_INDEX)


export const USE_APPROVAL_SIGNATURE = decrypt(
	process.env.USE_ENCRYPTED_KEY, 
	process.env.USE_IV, 
	{
		encriptionAlgorithm: "aes-256-cbc",
		encriptionKey: ENCRYPTION_KEY
	})

/*
	SET WHICH CHAIN TO USE
*/

// Sepolia
// export const USE_RPC = SEPOLIA_RPC;
// export const USE_PAYMASTER_RPC = SEPOLIA_PAYMASTER_RPC;
// export const USE_BUNDLER_RPC = `${SEPOLIA_BUNDLER_RPC}?provider=ALCHEMY`;
// export const USE_USDC_CONTRACT = SEPOLIA_USDC_CONTRACT;
// export const USE_CHAIN = sepolia

// Linea
export const USE_RPC = LINEA_RPC;
export const USE_PAYMASTER_RPC = LINEA_PAYMASTER_RPC;
export const USE_BUNDLER_RPC =`${LINEA_BUNDLER_RPC}?provider=ALCHEMY`;
export const USE_USDC_CONTRACT = LINEA_USDC_CONTRACT;
export const USE_CHAIN = linea

// Linea Sepolia
// export const USE_RPC = LINEA_SEPOLIA_RPC;
// export const USE_PAYMASTER_RPC = LINEA_SEPOLIA_PAYMASTER_RPC;
// export const USE_BUNDLER_RPC = LINEA_SEPOLIA_BUNDLER_RPC;
// export const USE_USDC_CONTRACT = LINEA_SEPOLIA_USDC_CONTRACT;
// export const USE_CHAIN = lineaSepolia