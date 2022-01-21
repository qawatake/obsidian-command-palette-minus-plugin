export * from 'obsidian';

declare module 'obsidian' {
	interface App {
		commands: CommandManager;
	}

	interface CommandManager {
		executeCommandById(id: string): void;
		findCommand(id: string): void;
	}
}
