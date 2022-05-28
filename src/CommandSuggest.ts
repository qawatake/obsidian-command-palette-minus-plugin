import CommandPaletteMinusPlugin from 'main';
import { App, Command, prepareFuzzySearch } from 'obsidian';
import { TextInputSuggest } from 'utils/suggest';

export class CommandSuggest extends TextInputSuggest<Command> {
	private plugin: CommandPaletteMinusPlugin;
	private _onSelected: ((cmd: Command) => void) | undefined;

	constructor(
		app: App,
		inputEl: HTMLInputElement | HTMLTextAreaElement,
		plugin: CommandPaletteMinusPlugin
	) {
		super(app, inputEl);
		this.plugin = plugin;
	}

	getSuggestions(query: string): Command[] {
		const fuzzy = prepareFuzzySearch(query);
		const commands = Object.values(this.app.commands.commands);
		return (
			commands
				// remove selected commands
				.filter(
					(cmd) =>
						!(
							cmd.id in
							(this.plugin.settings?.selectedCommands ?? {})
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
							'[ERROR in Command Palette--] failed to sort commands in suggestion.'
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
