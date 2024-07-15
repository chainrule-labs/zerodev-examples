import { getKernelAddressFromECDSA } from "@zerodev/ecdsa-validator";
import { http, createPublicClient } from "viem";
import { USE_RPC } from "./constants.js";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";


export async function getSmartAccountAddress(owner, index) {
	// INSTANTIATE A PUBLIC CLIENT
	const publicClient = createPublicClient({
		transport: http(USE_RPC),
	});

	const params = {
		publicClient,
		eoaAddress: owner.toLowerCase(),
		index,
		kernelVersion: KERNEL_V3_1,
		entryPoint: ENTRYPOINT_ADDRESS_V07,
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
