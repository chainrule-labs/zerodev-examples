import {
	createKernelAccount,
	createZeroDevPaymasterClient,
	createKernelAccountClient,
	addressToEmptyAccount,
	getCustomNonceKeyFromString
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
import {
	USE_PAYMASTER_RPC,
	USE_BUNDLER_RPC,
	USE_USDC_CONTRACT,
	USE_APPROVAL_SIGNATURE,
	USE_CHAIN,
	TEST_HOT_WALLET,
	TEST_OWNER_PK,
	UNAUTHORIZED_ADDRESS,
	TEST_LOCKER_AGENT,
	TEST_OWNER,
	TEST_LOCKER_AGENT_PK,
	TEST_BEAM_ADDRESS
} from "./constants.js";



/*//////////////////////////////////////////////////////
**           THIS HAPPENS ON THE FRONTEND             **
//////////////////////////////////////////////////////*/
const getApproval = async (lockerAgent, publicClient, entryPoint) => {
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
	const combinedPolicy = getCombinedPolicy(TEST_HOT_WALLET, TEST_BEAM_ADDRESS)

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

// /*//////////////////////////////////////////////////////
// **           THIS HAPPENS ON THE BACKEND              **
// //////////////////////////////////////////////////////*/
// const useSessionKey = async (approval, sessionKeySigner, publicClient) => {
// 	console.log("useSessionKey")
// 	const sessionKeyAccount = await deserializePermissionAccount(
// 		publicClient,
// 		entryPoint,  
// 		KERNEL_V3_1,
// 		approval,
// 		sessionKeySigner
// 	);

// 	const kernelPaymaster = createZeroDevPaymasterClient({
// 		entryPoint,
// 		chain,
// 		transport: http(paymaster),
// 	});
// 	const kernelClient = createKernelAccountClient({
// 		entryPoint,
// 		account: sessionKeyAccount,
// 		chain,
// 		bundlerTransport: http(bundler, {
// 			timeout: 30_000
// 		  }),
// 		middleware: {
// 			sponsorUserOperation: kernelPaymaster.sponsorUserOperation,
// 		},
// 	});

// 	const nonceKey1 = getCustomNonceKeyFromString(
// 		"nonce1",
// 		entryPoint,
// 	  )
	   
// 	  const nonce1 = await sessionKeyAccount.getNonce(nonceKey1)

// 	// TEST SENDING USDC TO HOT WALLET (SHOULD WORK)
// 	try {
// 		const amountToSend = parseUnits(usdcAmountToSend, 6)
// 		const functionData = {
// 			abi: erc20Abi,
// 			functionName: "transfer",
// 			args: [TEST_HOT_WALLET, amountToSend],
// 		}
// 		// console.log("functionData:", functionData)

// 		const userOpHash1 = await kernelClient.sendUserOperation({
// 			userOperation: {
// 				callData: sessionKeyAccount.encodeCallData([
// 					{
// 						to: USE_USDC_CONTRACT,
// 						value: BigInt(0),
// 						data: encodeFunctionData(functionData),
// 					},
// 				]),
// 				nonce: nonce1,
// 			},
// 		});
// 		console.log("USDC to Hot Wallet - UserOpHash:", userOpHash1);

// 	} catch (error) {
// 		const status = error.status || "unknown status";
// 		const details = error.details || "no details available";
// 		console.error(
// 			`Failed to send USDC to Hot Wallet - Status: ${status}, Details: ${details}`
// 		);
// 	}

// 	// TEST SENDING USDC TO BEAM OFFRAMP ACCOUNT (SHOULD WORK)
// 	const nonceKey2 = getCustomNonceKeyFromString(
// 		"nonce2",
// 		entryPoint,
// 	  )
	   
// 	  const nonce2 = await sessionKeyAccount.getNonce(nonceKey2)
// 	try {
// 		const userOpHash2 = await kernelClient.sendUserOperation({
// 			userOperation: {
// 				callData: sessionKeyAccount.encodeCallData([
// 					{
// 						to: USE_USDC_CONTRACT,
// 						value: BigInt(0),
// 						data: encodeFunctionData({
// 							abi: erc20Abi,
// 							functionName: "transfer",
// 							args: [TEST_BEAM_ADDRESS, parseUnits(usdcAmountToSend, 6)],
// 						}),
// 					},
// 				]),
// 				nonce: nonce2,
// 			},
// 		});
// 		console.log("USDC to Beam Offramp - UserOpHash:", userOpHash2);
// 	} catch (error) {
// 		const status = error.status || "unknown status";
// 		const details = error.details || "no details available";
// 		console.error(
// 			`Failed to send USDC to Beam Offramp - Status: ${status}, Details: ${details}`
// 		);
// 	}

// 	// TEST SENDING USDC TO UNAUTHORIZED ACCOUNT (SHOULD FAIL)
// 	try {
// 		const nonceKey3 = getCustomNonceKeyFromString(
// 			"nonce3",
// 			entryPoint,
// 		  )
		   
// 		  const nonce3 = await sessionKeyAccount.getNonce(nonceKey3)
// 		const userOpHash3 = await kernelClient.sendUserOperation({
// 			userOperation: {
// 				callData: sessionKeyAccount.encodeCallData([
// 					{
// 						to: USE_USDC_CONTRACT,
// 						value: BigInt(0),
// 						data: encodeFunctionData({
// 							abi: erc20Abi,
// 							functionName: "transfer",
// 							args: [UNAUTHORIZED_ADDRESS, parseUnits(usdcAmountToSend, 6)],
// 						}),
// 					},
// 				]),
// 				nonce: nonce3,
// 			},
// 		});
// 		console.log("USDC to Unauthorized Account - UserOpHash:", userOpHash3);
// 	} catch (error) {
// 		const status = error.status || "unknown status";
// 		const details = error.details || "no details available";
// 		console.error(
// 			`Failed to send USDC to Unauthorized Account (expected) - Status: ${status}, Details: ${details}`
// 		);
// 	}


// 	// TEST SENDING ETH TO HOT WALLET (SHOULD WORK)
// 	try {
// 		const nonceKey4 = getCustomNonceKeyFromString(
// 			"nonce4",
// 			entryPoint,
// 		  )
		   
// 		  const nonce4 = await sessionKeyAccount.getNonce(nonceKey4)
// 		const txHash1 = await kernelClient.sendTransaction({
// 			to: TEST_HOT_WALLET,
// 			data: pad("0x", { size: 4 }),
// 			value: parseUnits(ethAmountToSend, 18),
// 			nonce: nonce4
// 		});
// 		console.log("ETH to Hot Wallet - TxHash:", txHash1);
// 	} catch (error) {
// 		console.error("error:", error)
// 		const status = error.status || "unknown status";
// 		const details = error.details || "no details available";
// 		console.error(
// 			`Failed to send ETH to Hot Wallet - Status: ${status}, Details: ${details}`
// 		);
// 	}

// 	// TEST SENDING ETH TO BEAM OFFRAMP ACCOUNT (SHOULD WORK)
// 	try {
// 		const nonceKey5 = getCustomNonceKeyFromString(
// 			"nonce4",
// 			entryPoint,
// 		  )
		   
// 		  const nonce5 = await sessionKeyAccount.getNonce(nonceKey5)
// 		const txHash2 = await kernelClient.sendTransaction({
// 			to: TEST_BEAM_ADDRESS,
// 			data: pad("0x", { size: 4 }),
// 			value: parseUnits(ethAmountToSend, 18),
// 			nonce: nonce5
// 		});
// 		console.log("ETH to Beam Offramp - TxHash:", txHash2);
// 	} catch (error) {
// 		const status = error.status || "unknown status";
// 		const details = error.details || "no details available";
// 		console.error(
// 			`Failed to send ETH to Beam Offramp - Status: ${status}, Details: ${details}`
// 		);
// 	}

// 	// TEST SENDING ETH TO UNAUTHORIZED ACCOUNT (SHOULD FAIL)
// 	try {
// 		const nonceKey6 = getCustomNonceKeyFromString(
// 			"nonce6",
// 			entryPoint,
// 		  )
		   
// 		  const nonce6 = await sessionKeyAccount.getNonce(nonceKey6)
// 		const txHash3 = await kernelClient.sendTransaction({
// 			to: UNAUTHORIZED_ADDRESS,
// 			data: pad("0x", { size: 4 }),
// 			value: parseUnits("0.000015", 18),
// 			nonce: nonce6
// 		});
// 		console.log("ETH to Unauthorized Account - TxHash:", txHash3);
// 	} catch (error) {
// 		const status = error.status || "unknown status";
// 		const details = error.details || "no details available";
// 		console.error(
// 			`Failed to send ETH to Unauthorized Account (expected) - Status: ${status}, Details: ${details}`
// 		);
// 	}
// };
//////////////////////////////////////////////////////*/
//////////////////////////////////////////////////////*/

const useSessionKeyOnce = async (approval, sessionKeySigner, publicClient, paymaster, bundler, chain, usdcAmountToSend, entryPoint) => {
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
		bundlerTransport: http(bundler, {
			timeout: 30_000
		  }),
		middleware: {
			sponsorUserOperation: kernelPaymaster.sponsorUserOperation,
		},
	});

	const nonceKey1 = getCustomNonceKeyFromString(
		"nonce1",
		entryPoint,
	  )
	   
	  const nonce1 = await sessionKeyAccount.getNonce(nonceKey1)

	// TEST SENDING USDC TO HOT WALLET (SHOULD WORK)
	try {
		const amountToSend = parseUnits(usdcAmountToSend, 6)
		const functionData = {
			abi: erc20Abi,
			functionName: "transfer",
			args: [TEST_HOT_WALLET, amountToSend],
		}
		// console.log("functionData:", functionData)

		const userOpHash1 = await kernelClient.sendUserOperation({
			userOperation: {
				callData: sessionKeyAccount.encodeCallData([
					{
						to: USE_USDC_CONTRACT,
						value: BigInt(0),
						data: encodeFunctionData(functionData),
					},
				]),
				nonce: nonce1,
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

};

const main = async () => {
	// CONSTANTS
	const entryPoint = ENTRYPOINT_ADDRESS_V07;
	const paymaster = USE_PAYMASTER_RPC;
	console.log("paymaster:", paymaster)
	const bundler = USE_BUNDLER_RPC;
	console.log("bundler:", bundler)
	const chain = USE_CHAIN;
	console.log("chain:", chain)
	const usdcAmountToSend = "0.001";
	const ethAmountToSend = "0.000015"

	// INSTANTIATE A PUBLIC CLIENT
	const publicClient = createPublicClient({
		transport: http(bundler),
	});

	console.log("Starting to process")
	// ON THE BACKEND
	const sessionKeyAccount = privateKeyToAccount(TEST_LOCKER_AGENT_PK);
	const sessionKeySigner = toECDSASigner({
		signer: sessionKeyAccount,
	});

	// ON THE FRONTEND
	console.log("Getting approval from the frontend...");
	const approvalSignature = await getApproval(TEST_LOCKER_AGENT, publicClient, entryPoint);
	// const approvalSignature = USE_APPROVAL_SIGNATURE
	console.log("Approval Signature:", approvalSignature);
	

	// ON THE BACKEND
	console.log("Using session key on the backend...");
	await useSessionKeyOnce(approvalSignature, sessionKeySigner, publicClient, paymaster, bundler, chain, usdcAmountToSend, entryPoint);
};

console.log("Running main function")
main();
