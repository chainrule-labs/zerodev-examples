import crypto from "crypto";
import { ENCRYPTION_KEY } from "./constants.js";

export function decrypt(
	encryptedText,
	iv,
	configuration
) {
	const decipher = crypto.createDecipheriv(
		configuration.encriptionAlgorithm,
		Buffer.from(configuration.encriptionKey, "base64"),
		Buffer.from(iv, "base64")
	);
	let decrypted = decipher.update(encryptedText, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}

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
