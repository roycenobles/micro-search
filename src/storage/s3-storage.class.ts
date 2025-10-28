import { IStorage } from "./storage.interface.js";

export class S3Storage implements IStorage {
	destroy(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	exists(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	isCurrent(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	lastModified(): Promise<string | undefined> {
		throw new Error("Method not implemented.");
	}
	read(): Promise<any> {
		throw new Error("Method not implemented.");
	}
	write(data: any): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
