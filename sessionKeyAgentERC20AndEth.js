import {
	createKernelAccount,
	createZeroDevPaymasterClient,
	createKernelAccountClient,
	addressToEmptyAccount,
} from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
	deserializePermissionAccount,
	serializePermissionAccount,
	toPermissionValidator,
} from "@zerodev/permissions";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { getErc20Policy, getCombinedPolicy } from "./getPolicies.js";
import { erc20Abi, parseUnits } from "viem";
import { getSmartAccountAddress } from "./getCounterfactual.mjs";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";


import { http, createPublicClient, encodeFunctionData, pad } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import {
	SEPOLIA_PAYMASTER_RPC,
	SEPOLIA_BUNDLER_RPC,
	SEPOLIA_USDC_CONTRACT,
	TEST_HOT_WALLET,
	TEST_OWNER_PK,
	UNAUTHORIZED_ADDRESS,
	TEST_LOCKER_AGENT,
	TEST_OWNER,
	TEST_LOCKER_AGENT_PK,
} from "./constants.js";

// CONSTANTS
const entryPoint = ENTRYPOINT_ADDRESS_V07;
const paymaster = SEPOLIA_PAYMASTER_RPC;
const bundler = SEPOLIA_BUNDLER_RPC;
const chain = sepolia;
const usdcAmountToSend = "0.001";

// INSTANTIATE A PUBLIC CLIENT
const publicClient = createPublicClient({
	transport: http(bundler),
});

/*//////////////////////////////////////////////////////
**           THIS HAPPENS ON THE FRONTEND             **
//////////////////////////////////////////////////////*/
const getApproval = async (lockerAgent) => {
	const smartAccountAddress = await getSmartAccountAddress(TEST_OWNER);

	console.log("\n\n");
	console.log("Locker Account: ", smartAccountAddress);
	console.log("Locker Owner: ", TEST_OWNER);
	console.log("Authorized Locker Agent:", lockerAgent);
	console.log("\n");

	const signer = privateKeyToAccount(TEST_OWNER_PK);

	const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
		entryPoint,
		signer,
		kernelVersion: KERNEL_V3_1,
	});

	const emptyAccount = addressToEmptyAccount(lockerAgent);
	const emptySessionKeySigner = toECDSASigner({ signer: emptyAccount });

	// const hotWalletErc20Policy = getErc20Policy(TEST_HOT_WALLET);
	// const hotWalletNativePolicy = getNativePolicy(TEST_HOT_WALLET);
	// const offrampErc20Policy = getErc20Policy(TEST_BEAM_ADDRESS);
	// const offrampNativePolicy = getNativePolicy(TEST_BEAM_ADDRESS);
	const combinedPolicy = getCombinedPolicy(TEST_HOT_WALLET)

	const permissionPlugin = await toPermissionValidator(publicClient, {
		entryPoint,
		signer: emptySessionKeySigner,
		kernelVersion: KERNEL_V3_1,
		policies: [
			// hotWalletErc20Policy,
			// hotWalletNativePolicy,
			// offrampErc20Policy,
			// offrampNativePolicy,
			combinedPolicy
		],
	});

	const sessionKeyAccount = await createKernelAccount(publicClient, {
		kernelVersion: KERNEL_V3_1,
		entryPoint,
		plugins: {
			sudo: ecdsaValidator,
			regular: permissionPlugin,
		},
	});

	// NOTE: this is the signature that will be sent to the backend
	return await serializePermissionAccount(sessionKeyAccount);
};
//////////////////////////////////////////////////////*/
//////////////////////////////////////////////////////*/

/*//////////////////////////////////////////////////////
**           THIS HAPPENS ON THE BAKCEND              **
//////////////////////////////////////////////////////*/
const useSessionKey = async (approval, sessionKeySigner) => {
	console.log("useSessionKey")
	const sessionKeyAccount = await deserializePermissionAccount(
		publicClient,
		entryPoint,  
		KERNEL_V3_1,
		approval,
		sessionKeySigner
	);

	const kernelPaymaster = createZeroDevPaymasterClient({
		entryPoint,
		chain,
		transport: http(paymaster),
	});
	const kernelClient = createKernelAccountClient({
		entryPoint,
		account: sessionKeyAccount,
		chain,
		bundlerTransport: http(bundler),
		middleware: {
			sponsorUserOperation: kernelPaymaster.sponsorUserOperation,
		},
	});

	// TEST SENDING USDC TO HOT WALLET (SHOULD WORK)
	console.log("Send USD to hot wallet")
	try {
		const amountToSend = parseUnits(usdcAmountToSend, 6)
		const functionData = {
			abi: erc20Abi,
			functionName: "transfer",
			args: [TEST_HOT_WALLET, amountToSend],
		}
		console.log("functionData:", functionData)

		const userOpHash1 = await kernelClient.sendUserOperation({
			userOperation: {
				callData: sessionKeyAccount.encodeCallData([
					{
						to: SEPOLIA_USDC_CONTRACT,
						value: BigInt(0),
						data: encodeFunctionData(functionData),
					},
				]),
			},
		});
		console.log("USDC to Hot Wallet - UserOpHash:", userOpHash1);
	} catch (error) {
		const status = error.status || "unknown status";
		const details = error.details || "no details available";
		console.error(
			`Failed to send USDC to Hot Wallet - Status: ${status}, Details: ${details}`
		);
	}

	// TEST SENDING USDC TO BEAM OFFRAMP ACCOUNT (SHOULD WORK)
	// try {
	// 	const userOpHash2 = await kernelClient.sendUserOperation({
	// 		userOperation: {
	// 			callData: sessionKeyAccount.encodeCallData([
	// 				{
	// 					to: SEPOLIA_USDC_CONTRACT,
	// 					value: BigInt(0),
	// 					data: encodeFunctionData({
	// 						abi: erc20Abi,
	// 						functionName: "transfer",
	// 						args: [TEST_BEAM_ADDRESS, parseUnits("0.02", 6)],
	// 					}),
	// 				},
	// 			]),
	// 		},
	// 	});
	// 	console.log("USDC to Beam Offramp - UserOpHash:", userOpHash2);
	// } catch (error) {
	// 	const status = error.status || "unknown status";
	// 	const details = error.details || "no details available";
	// 	console.error(
	// 		`Failed to send USDC to Beam Offramp - Status: ${status}, Details: ${details}`
	// 	);
	// }

	// TEST SENDING USDC TO UNAUTHORIZED ACCOUNT (SHOULD FAIL)
	// try {
	// 	const userOpHash3 = await kernelClient.sendUserOperation({
	// 		userOperation: {
	// 			callData: sessionKeyAccount.encodeCallData([
	// 				{
	// 					to: SEPOLIA_USDC_CONTRACT,
	// 					value: BigInt(0),
	// 					data: encodeFunctionData({
	// 						abi: erc20Abi,
	// 						functionName: "transfer",
	// 						args: [UNAUTHORIZED_ADDRESS, parseUnits("0.02", 6)],
	// 					}),
	// 				},
	// 			]),
	// 		},
	// 	});
	// 	console.log("USDC to Unauthorized Account - UserOpHash:", userOpHash3);
	// } catch (error) {
	// 	const status = error.status || "unknown status";
	// 	const details = error.details || "no details available";
	// 	console.error(
	// 		`Failed to send USDC to Unauthorized Account (expected) - Status: ${status}, Details: ${details}`
	// 	);
	// }

	// TEST SENDING ETH TO HOT WALLET (SHOULD WORK)
	// try {
	// 	const txHash1 = await kernelClient.sendTransaction({
	// 		to: TEST_HOT_WALLET,
	// 		data: pad("0x", { size: 4 }),
	// 		value: parseUnits("0.000015", 18),
	// 	});
	// 	console.log("ETH to Hot Wallet - TxHash:", txHash1);
	// } catch (error) {
	// 	const status = error.status || "unknown status";
	// 	const details = error.details || "no details available";
	// 	console.error(
	// 		`Failed to send ETH to Hot Wallet - Status: ${status}, Details: ${details}`
	// 	);
	// }

	// TEST SENDING ETH TO BEAM OFFRAMP ACCOUNT (SHOULD WORK)
	// try {
	// 	const txHash2 = await kernelClient.sendTransaction({
	// 		to: TEST_BEAM_ADDRESS,
	// 		data: pad("0x", { size: 4 }),
	// 		value: parseUnits("0.000015", 18),
	// 	});
	// 	console.log("ETH to Beam Offramp - TxHash:", txHash2);
	// } catch (error) {
	// 	const status = error.status || "unknown status";
	// 	const details = error.details || "no details available";
	// 	console.error(
	// 		`Failed to send ETH to Beam Offramp - Status: ${status}, Details: ${details}`
	// 	);
	// }

	// TEST SENDING ETH TO UNAUTHORIZED ACCOUNT (SHOULD FAIL)
	// try {
	// 	const txHash3 = await kernelClient.sendTransaction({
	// 		to: UNAUTHORIZED_ADDRESS,
	// 		data: pad("0x", { size: 4 }),
	// 		value: parseUnits("0.000015", 18),
	// 	});
	// 	console.log("ETH to Unauthorized Account - TxHash:", txHash3);
	// } catch (error) {
	// 	const status = error.status || "unknown status";
	// 	const details = error.details || "no details available";
	// 	console.error(
	// 		`Failed to send ETH to Unauthorized Account (expected) - Status: ${status}, Details: ${details}`
	// 	);
	// }
};
//////////////////////////////////////////////////////*/
//////////////////////////////////////////////////////*/

const main = async () => {
	// ON THE BACKEND
	const sessionKeyAccount = privateKeyToAccount(TEST_LOCKER_AGENT_PK);
	const sessionKeySigner = toECDSASigner({
		signer: sessionKeyAccount,
	});

	// ON THE FRONTEND
	console.log("Getting approval from the frontend...");
	const approvalSignature = await getApproval(TEST_LOCKER_AGENT);

	// ON THE BACKEND
	console.log("Using session key on the backend...");
	await useSessionKey(approvalSignature, sessionKeySigner);
};

main();
