export * from 'obsidian';

declare module 'obsidian' {
	interface App {
		commands: CommandManager;
	}

	interface CommandManager {
		listCommands(): Command[];
		executeCommandById(id: string): void;
		findCommand(id: string): void;
	}
}
