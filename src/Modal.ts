import CommandPaletteMiniPlugin from 'main';
import { App, Command, FuzzySuggestModal } from 'obsidian';

export class CommandPaletteMiniModal extends FuzzySuggestModal<Command> {
	private plugin: CommandPaletteMiniPlugin;

	constructor(app: App, plugin: CommandPaletteMiniPlugin) {
		super(app);
		this.plugin = plugin;

		this.scope.register(['Ctrl'], 'p', () => {
			this.inputEl.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowUp' })
			);
		});
		this.scope.register(['Ctrl'], 'n', () => {
			this.inputEl.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowDown' })
			);
		});

		this.setInstructions([
			{
				command: '↑↓',
				purpose: 'to navigate',
			},
			{
				command: 'ctrl p/n',
				purpose: 'to navigate',
			},
			{
				command: '↵',
				purpose: 'to use',
			},
			{
				command: 'esc',
				purpose: 'to dismiss',
			},
		]);
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
