import { CommandPaletteMinusModal } from 'Modal';
import { Plugin } from 'obsidian';
import {
	CommandPaletteMinusSettings,
	CommandPaletteMinusSettingTab,
	DEFAULT_SETTINGS,
} from 'Setting';

const LOCAL_COMMAND_ID = 'open';
const PLUGIN_ID = 'obsidian-command-palette-minus-plugin';
export const GLOBAL_COMMAND_ID = `${PLUGIN_ID}:${LOCAL_COMMAND_ID}`;

export default class CommandPaletteMinusPlugin extends Plugin {
	settings: CommandPaletteMinusSettings | undefined;

	override async onload() {
		await this.loadSettings();

		this.addCommand({
			id: LOCAL_COMMAND_ID,
			name: 'Open command palette',
			callback: () => {
				new CommandPaletteMinusModal(this.app, this).open();
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
