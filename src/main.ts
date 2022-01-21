import { CommandPaletteMiniModal } from 'Modal';
import { Plugin } from 'obsidian';
import {
	CommandPaletteMiniSettings,
	CommandPaletteMiniSettingTab,
	DEFAULT_SETTINGS,
} from 'Setting';

// Remember to rename these classes and interfaces!

export default class CommandPaletteMiniPlugin extends Plugin {
	settings: CommandPaletteMiniSettings | undefined;

	override async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'command-palette-mini:open',
			name: 'Open command palette',
			callback: () => {
				const modal = new CommandPaletteMiniModal(this.app, this);
				console.log(modal);
				modal.open();
			},
		});

		// // This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CommandPaletteMiniSettingTab(this.app, this));
	}

	// override onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const { contentEl } = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const { contentEl } = this;
// 		contentEl.empty();
// 	}
// }

// class SampleSettingTab extends PluginSettingTab {
// 	plugin: MyPlugin;

// 	constructor(app: App, plugin: MyPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}

// 	display(): void {
// 		const { containerEl } = this;

// 		containerEl.empty();

// 		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

// 		new Setting(containerEl)
// 			.setName('Setting #1')
// 			.setDesc("It's a secret")
// 			.addText((text) =>
// 				text
// 					.setPlaceholder('Enter your secret')
// 					.setValue(this.plugin.settings.mySetting)
// 					.onChange(async (value) => {
// 						console.log('Secret: ' + value);
// 						this.plugin.settings.mySetting = value;
// 						await this.plugin.saveSettings();
// 					})
// 			);
// 	}
// }
