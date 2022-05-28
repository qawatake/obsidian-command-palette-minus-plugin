import { CommandSuggest } from 'CommandSuggest';
import CommandPaletteMinusPlugin from 'main';
import { App, Command, PluginSettingTab, Setting } from 'obsidian';

interface RemovedCommandMap {
	[commandId: string]: RegisteredAt;
}

type RegisteredAt = number;

interface UsedCommandMap {
	[commandId: string]: UsedAt;
}

type UsedAt = number;

export interface CommandPaletteMinusSettings {
	selectedCommands: RemovedCommandMap;
	usedCommands: UsedCommandMap;
	allowMode: boolean;
	inject: boolean;
}

export const DEFAULT_SETTINGS: CommandPaletteMinusSettings = {
	selectedCommands: {},
	usedCommands: {},
	allowMode: false,
	inject: false,
};

export class CommandPaletteMinusSettingTab extends PluginSettingTab {
	private readonly plugin: CommandPaletteMinusPlugin;
	private inputEl: HTMLInputElement | undefined;

	constructor(app: App, plugin: CommandPaletteMinusPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		const settings = this.plugin.settings;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Inject the default command palette')
			.setDesc(
				'Turn on to inject the default command palette. The slash commands plugin will also be affected.'
			)
			.addToggle((component) => {
				component.setValue(settings.inject).onChange((value) => {
					settings.inject = value;
					this.plugin.inject(value);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Mode: Deny list / Allow list')
			.setDesc(
				'Turn on to allow the commands in the list, and turn off to deny the commands in the list.'
			)
			.addToggle((component) => {
				component.setValue(settings.allowMode).onChange((value) => {
					settings.allowMode = value;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Select command')
			.addSearch((component) => {
				this.inputEl = component.inputEl;
				new CommandSuggest(
					this.app,
					component.inputEl,
					this.plugin
				).onSelected(async (cmd: Command) => {
					if (!this.plugin.settings) {
						return;
					}
					this.plugin.settings.selectedCommands[cmd.id] = Date.now();
					await this.plugin.saveSettings();
					this.display();
					this.focus();
				});
			});

		Object.entries(this.plugin.settings?.selectedCommands)
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
							delete this.plugin.settings?.selectedCommands[
								cmd.id
							];
							await this.plugin.saveSettings();
							this.display();
						});
					});
			});
	}

	private focus() {
		this.inputEl?.focus();
	}
}
