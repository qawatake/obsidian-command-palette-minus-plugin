import CommandPaletteMiniPlugin from 'main';
import { App, Command, prepareFuzzySearch } from 'obsidian';
import { TextInputSuggest } from 'utils/suggest';

export class CommandSuggest extends TextInputSuggest<Command> {
	private plugin: CommandPaletteMiniPlugin;
	private _onSelected: ((cmd: Command) => void) | undefined;

	constructor(
		app: App,
		inputEl: HTMLInputElement | HTMLTextAreaElement,
		plugin: CommandPaletteMiniPlugin
	) {
		super(app, inputEl);
		this.plugin = plugin;
	}

	getSuggestions(query: string): Command[] {
		const fuzzy = prepareFuzzySearch(query);
		const commands = this.app.commands.listCommands();
		return (
			commands
				// remove commands
				.filter(
					(cmd) =>
						!Object.prototype.hasOwnProperty.call(
							this.plugin.settings?.removedCommands,
							cmd.id
						)
				)
				// use score for sort
				.map((cmd) => {
					const result = fuzzy(cmd.name);
					return { score: result?.score, command: cmd };
				})
				.filter((result) => result.score !== undefined)
				// sort by score
				.sort((a, b) => {
					if (a.score !== undefined && b.score !== undefined) {
						return b.score - a.score;
					} else {
						console.log(
							'[ERROR in Command Palette Mini] failed to sort commands in suggestion.'
						);
						return 0;
					}
				})
				// abstract command
				.map((result) => result.command)
		);
	}

	renderSuggestion(cmd: Command, el: HTMLElement): void {
		el.textContent = cmd.name;
	}

	selectSuggestion(cmd: Command): void {
		if (this._onSelected) {
			this._onSelected(cmd);
		}

		this.close();
	}

	onSelected(cb: (cmd: Command) => void) {
		this._onSelected = cb;
	}
}
