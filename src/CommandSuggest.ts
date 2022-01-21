import { App, Command, prepareFuzzySearch } from 'obsidian';
import { TextInputSuggest } from 'utils/suggest';

export class CommandSuggest extends TextInputSuggest<Command> {
	private _onSelected: ((cmd: Command) => void) | undefined;

	constructor(app: App, inputEl: HTMLInputElement | HTMLTextAreaElement) {
		super(app, inputEl);
	}

	getSuggestions(query: string): Command[] {
		const fuzzy = prepareFuzzySearch(query);
		const commands = this.app.commands.listCommands();
		return commands
			.map((cmd) => {
				const result = fuzzy(cmd.name);
				return { score: result?.score, command: cmd };
			})
			.filter((result) => {
				return result.score !== undefined;
			})
			.sort((a, b) => {
				if (a.score !== undefined && b.score !== undefined) {
					return b.score - a.score;
				} else {
					console.log(
						'[ERROR in Command Palette Mini: failed to sort commands.'
					);
					return 0;
				}
			})
			.map((result) => result.command);
	}

	renderSuggestion(cmd: Command, el: HTMLElement): void {
		el.textContent = cmd.name;
	}

	selectSuggestion(cmd: Command): void {
		this.inputEl.value = cmd.name;
		this.inputEl.trigger('input');

		if (this._onSelected) {
			this._onSelected(cmd);
		}

		this.close();
	}

	onSelected(cb: (cmd: Command) => void) {
		this._onSelected = cb;
	}
}
