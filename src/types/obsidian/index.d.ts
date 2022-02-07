export * from 'obsidian';

declare module 'obsidian' {
	interface App {
		commands: CommandManager;
	}

	interface CommandManager {
		listCommands(): Command[]; // list only available commands
		commands: CommandMap; // list all commands
		executeCommandById(id: string): void;
		findCommand(id: string): Command | undefined | null;
	}

	interface CommandMap {
		[commandId: string]: Command;
	}

	interface FuzzySuggestModal {
		chooser: Chooser;
	}

	interface Chooser {
		selectedItem: number;
		setSelectedItem(item: number): void;
		useSelectedItem(ev: Partial<KeyboardEvent>): void;
	}
}
