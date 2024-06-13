import dotenv from "dotenv";

dotenv.config();

export const SEPOLIA_RPC = process.env.SEPOLIA_RPC;

export const SEPOLIA_PAYMASTER_RPC = process.env.SEPOLIA_PAYMASTER_RPC;

export const SEPOLIA_BUNDLER_RPC = process.env.SEPOLIA_BUNDLER_RPC;

export const SEPOLIA_USDC_CONTRACT =
	"0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export const TEST_LOCKER_AGENT_PK = process.env.TEST_LOCKER_AGENT_PK;

export const TEST_LOCKER_AGENT = process.env.TEST_LOCKER_AGENT;

export const TEST_BEAM_ADDRESS = process.env.TEST_BEAM_ADDRESS;

export const TEST_HOT_WALLET = process.env.TEST_HOT_WALLET;

export const UNAUTHORIZED_ADDRESS = process.env.UNAUTHORIZED_ADDRESS;

export const TEST_OWNER = process.env.TEST_OWNER;

export const TEST_OWNER_PK = process.env.TEST_OWNER_PK;
