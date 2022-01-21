export * from 'obsidian';

declare module 'obsidian' {
	interface App {
		commands: CommandManager;
	}

	interface CommandManager {
		listCommands(): Command[];
		executeCommandById(id: string): void;
		findCommand(id: string): Command | undefined | null;
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
