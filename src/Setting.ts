import { CommandSuggest } from 'CommandSuggest';
import CommandPaletteMinusPlugin from 'main';
import { App, Command, PluginSettingTab, Setting } from 'obsidian';

interface CommandMap {
	// key: command id
	// value: timestamp at which a command added
	[id: string]: number;
}

export interface CommandPaletteMinusSettings {
	removedCommands: CommandMap;
}

export const DEFAULT_SETTINGS: CommandPaletteMinusSettings = {
	removedCommands: {},
};

export class CommandPaletteMinusSettingTab extends PluginSettingTab {
	private plugin: CommandPaletteMinusPlugin;

	constructor(app: App, plugin: CommandPaletteMinusPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Remove command')
			.addSearch((component) => {
				new CommandSuggest(
					this.app,
					component.inputEl,
					this.plugin
				).onSelected(async (cmd: Command) => {
					if (!this.plugin.settings) {
						return;
					}
					this.plugin.settings.removedCommands[cmd.id] = Date.now();
					await this.plugin.saveSettings();
					this.display();
				});
			});

		Object.entries(this.plugin.settings?.removedCommands)
			// new ↓ old
			.sort((entry1, entry2) => {
				const timestamp1 = entry1[1],
					timestamp2 = entry2[1];
				const bothNum =
					typeof timestamp1 === 'number' &&
					typeof timestamp2 === 'number';
				if (bothNum) {
					return timestamp2 - timestamp1; // new ↓ old
				} else {
					console.log(
						'[ERROR in Command Palette--] failed to sort commands in setting tab'
					);
					return 0;
				}
			})
			.forEach((entry) => {
				const id = entry[0];
				if (typeof id !== 'string') {
					console.log(
						'[ERROR in Command Palette--]: failed to display commands: wrong type'
					);
					return;
				}
				const cmd = this.app.commands.findCommand(id);
				if (!cmd) {
					return;
				}
				new Setting(containerEl)
					.setName(cmd.name)
					.addExtraButton((component) => {
						component.setIcon('cross').onClick(async () => {
							delete this.plugin.settings?.removedCommands[
								cmd.id
							];
							await this.plugin.saveSettings();
							this.display();
						});
					});
			});
	}
}
