import { CommandSuggest } from 'CommandSuggest';
import CommandPaletteMiniPlugin from 'main';
import { App, Command, PluginSettingTab, Setting } from 'obsidian';

export interface CommandPaletteMiniSettings {
	commands: string[];
}

export const DEFAULT_SETTINGS: CommandPaletteMiniSettings = {
	commands: [],
};

export class CommandPaletteMiniSettingTab extends PluginSettingTab {
	private plugin: CommandPaletteMiniPlugin;

	constructor(app: App, plugin: CommandPaletteMiniPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Add command')
			.addSearch((component) => {
				if (this.plugin.settings) {
					new CommandSuggest(this.app, component.inputEl).onSelected(
						(cmd: Command) => {
							if (!this.plugin.settings) {
								return;
							}
							this.plugin.settings.commands.push(cmd.id);
							this.plugin.saveSettings();
						}
					);
				}
			});
	}

	// search(query: string): { score: number | undefined; command: Command }[] {
	// 	const fuzzy = prepareFuzzySearch(query);
	// 	const commands = this.app.commands.listCommands();
	// 	return commands
	// 		.map((cmd) => {
	// 			const result = fuzzy(cmd.name);
	// 			return { score: result?.score, command: cmd };
	// 		})
	// 		.filter((result) => {
	// 			return result.score !== undefined;
	// 		})
	// 		.sort((a, b) => {
	// 			if (a.score !== undefined && b.score !== undefined) {
	// 				return b.score - a.score;
	// 			} else {
	// 				console.log(
	// 					'[ERROR in Command Palette Mini: failed to sort commands.'
	// 				);
	// 				return 0;
	// 			}
	// 		});
	// }
}
