import { CommandPaletteMiniModal } from 'Modal';
import { Plugin } from 'obsidian';
import {
	CommandPaletteMiniSettings,
	CommandPaletteMiniSettingTab,
	DEFAULT_SETTINGS,
} from 'Setting';

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
