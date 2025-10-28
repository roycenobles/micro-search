export interface IStorage {
	destroy(): Promise<void>;
	exists(): Promise<boolean>;
	isCurrent(): Promise<boolean>;
	lastModified(): Promise<string | undefined>;
	read(): Promise<any>;
	write(data: any): Promise<void>;
}
