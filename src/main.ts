import { CommandPaletteMinusModal } from 'Modal';
import { Plugin } from 'obsidian';
import {
	CommandPaletteMinusSettings,
	CommandPaletteMinusSettingTab,
	DEFAULT_SETTINGS,
} from 'Setting';

export default class CommandPaletteMinusPlugin extends Plugin {
	settings: CommandPaletteMinusSettings | undefined;

	override async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'command-palette-minus:open',
			name: 'Open command palette',
			callback: () => {
				const modal = new CommandPaletteMinusModal(this.app, this);
				console.log(modal);
				modal.open();
			},
		});

		this.addSettingTab(new CommandPaletteMinusSettingTab(this.app, this));
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
