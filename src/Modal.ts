import CommandPaletteMiniPlugin from 'main';
import { App, Command, FuzzySuggestModal } from 'obsidian';

// export class CommandPaletteMiniModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	override onOpen() {
// 		const { contentEl } = this;
// 		contentEl.setText("Look at me, I'm a modal! 👀");
// 	}

// 	override onClose() {
// 		const { contentEl } = this;
// 		contentEl.empty();
// 	}
// }

export class CommandPaletteMiniModal extends FuzzySuggestModal<Command> {
	private plugin: CommandPaletteMiniPlugin;

	constructor(app: App, plugin: CommandPaletteMiniPlugin) {
		super(app);
		this.plugin = plugin;

		this.scope.register(['Ctrl'], 'p', () => {
			this.chooser.setSelectedItem(this.chooser.selectedItem - 1);
		});
		this.scope.register(['Ctrl'], 'n', () => {
			this.chooser.setSelectedItem(this.chooser.selectedItem + 1);
		});
	}

	getItems(): Command[] {
		const commands = this.app.commands.listCommands();
		return commands.filter(
			(cmd) =>
				!Object.prototype.hasOwnProperty.call(
					this.plugin.settings?.removedCommands,
					cmd.id
				)
		);
	}

	getItemText(cmd: Command): string {
		return cmd.name;
	}

	onChooseItem(cmd: Command, _evt: MouseEvent | KeyboardEvent): void {
		this.app.commands.executeCommandById(cmd.id);
	}
}
