import { CommandSuggest } from 'CommandSuggest';
import CommandPaletteMiniPlugin from 'main';
import { App, Command, Notice, PluginSettingTab, Setting } from 'obsidian';

interface CommandMap {
	// key: command id
	// value: timestamp at which a command added
	[id: string]: number;
}

export interface CommandPaletteMiniSettings {
	commands: CommandMap;
}

export const DEFAULT_SETTINGS: CommandPaletteMiniSettings = {
	commands: {},
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
				new CommandSuggest(this.app, component.inputEl).onSelected(
					async (cmd: Command) => {
						if (!this.plugin.settings) {
							return;
						}
						if (
							Object.prototype.hasOwnProperty.call(
								this.plugin.settings,
								cmd.id
							)
						) {
							new Notice(`"${cmd.name}" already exists!`);
						} else {
							this.plugin.settings.commands[cmd.id] = Date.now();
							await this.plugin.saveSettings();
						}
						this.display();
					}
				);
			});

		Object.entries(this.plugin.settings?.commands)
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
						'[ERROR in Command Palette Mini] failed to sort commands in setting tab'
					);
					return 0;
				}
			})
			.forEach((entry) => {
				const id = entry[0];
				if (typeof id !== 'string') {
					console.log(
						'[ERROR in Command Palette Mini]: failed to display commands: wrong type'
					);
					return;
				}
				const cmd = this.app.commands.findCommand(id);
				if (!cmd) {
					console.log('xxx');
					return;
				}
				new Setting(containerEl)
					.setName(cmd.name)
					.addExtraButton((component) => {
						component.setIcon('cross').onClick(async () => {
							delete this.plugin.settings?.commands[cmd.id];
							await this.plugin.saveSettings();
							this.display();
						});
					});
			});
	}
}
