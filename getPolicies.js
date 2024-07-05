import { ParamCondition, toCallPolicy } from "@zerodev/permissions/policies";
import { erc20Abi, zeroAddress, maxInt256 } from "viem";
import { SEPOLIA_USDC_CONTRACT } from "./constants.js";
import {
	CALL_POLICY_CONTRACT_V5_3_2,
	serializePermissionAccount,
	toPermissionValidator,
} from "@zerodev/permissions";

export const getErc20Policy = (toAddress) =>
	toCallPolicy({
		permissions: [
			{
				// zeroAddress is not working
				// Using zeroAddress means this policy applies to all ERC-20 tokens
				target: SEPOLIA_USDC_CONTRACT,

				// BigInt(0) disallows transferring native when calling transfer()
				valueLimit: BigInt(0),

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
		],
	});

export const getNativePolicy = (toAddress) =>
	toCallPolicy({
		permissions: [
			{
				// Restrict sending native to a specific address
				target: toAddress,

				// Allow transferring the maximum possible value
				valueLimit: maxInt256,
			},
		],
	});

	export const getCombinedPolicy = (toAddress) =>
		toCallPolicy({
			policyAddress: CALL_POLICY_CONTRACT_V5_3_2,
			permissions: [
				{
					// zeroAddress is not working
					// Using zeroAddress means this policy applies to all ERC-20 tokens
					// target: zeroAddress,
					target: SEPOLIA_USDC_CONTRACT,
					valueLimit: BigInt(0),
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
				// {
				// 	target: toAddress,
				// 	valueLimit: 1000000000000000n
				// }
			],
		});
	