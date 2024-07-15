import crypto from "crypto";
import { ENCRYPTION_KEY } from "./constants.js";


export function encrypt(text) {
	const iv = crypto.randomBytes(16); // Initialization vector
	const cipher = crypto.createCipheriv(
		"aes-256-cbc",
		Buffer.from(ENCRYPTION_KEY, "base64"),
		iv
	);
	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");
	return {
		iv: iv.toString("base64"), // Return the IV as a base64 encoded string
		encryptedText: encrypted,
	};
}
