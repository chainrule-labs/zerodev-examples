import { ParamCondition, toCallPolicy, CallPolicyVersion } from "@zerodev/permissions/policies";
import { erc20Abi, zeroAddress, maxInt256 } from "viem";

export const getCombinedPolicy = (toAddress) =>
	toCallPolicy({
		// policyAddress: CALL_POLICY_CONTRACT_V5_3_2,
		policyVersion: CallPolicyVersion.V0_0_2,
		permissions: [
			{
				// zeroAddress is not working
				// Using zeroAddress means this policy applies to all ERC-20 tokens
				target: zeroAddress,
				// target: SEPOLIA_USDC_CONTRACT,
				// valueLimit: BigInt(0),
				// Generic ERC-20 ABI
				abi: erc20Abi,

				// Limit scope to the transfer() function
				functionName: "transfer",

				// Specify the conditions of each argument
				//     --> transfer(address to, uint256 value)
				args: [
					// to
					{
						condition: ParamCondition.EQUAL,
						value: toAddress,
					},

					// value - null allows to send to any amount
					null,
				],
			},
			{
				target: toAddress,
				valueLimit: BigInt("100000000000000000000000000000")
			}
		],
	});
	