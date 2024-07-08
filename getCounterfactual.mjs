import { getKernelAddressFromECDSA } from "@zerodev/ecdsa-validator";
import { http, createPublicClient } from "viem";
import { SEPOLIA_RPC } from "./constants.js";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

// INSTANTIATE A PUBLIC CLIENT
const publicClient = createPublicClient({
	transport: http(SEPOLIA_RPC),
});

export async function getSmartAccountAddress(owner) {
	const params = {
		publicClient,
		eoaAddress: owner,
		index: 0,
		kernelVersion: KERNEL_V3_1,

	};

	return await getKernelAddressFromECDSA(params);

	// try {
	// 	const smartAccountAddress = await getKernelAddressFromECDSA(params);
	// 	console.log("smartAccount:", smartAccountAddress);
	// } catch (error) {
	// 	console.error("Error:", error);
	// }
}

// getSmartAccountAddress();
