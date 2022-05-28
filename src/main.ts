import { CommandPaletteMinusModal } from 'Modal';
import { Plugin, Command, Notice } from 'obsidian';
import {
	CommandPaletteMinusSettings,
	CommandPaletteMinusSettingTab,
	DEFAULT_SETTINGS,
} from 'Setting';

const LOCAL_COMMAND_ID = 'open';

export default class CommandPaletteMinusPlugin extends Plugin {
	settings!: CommandPaletteMinusSettings;
	defaultListCommandsFn: (() => Command[]) | undefined;

	override async onload() {
		await this.loadSettings();
		this.defaultListCommandsFn = this.app.commands.listCommands.bind(
			this.app.commands
		);
		if (!this.settings || !this.defaultListCommandsFn) {
			new Notice('Command Palette--: initializing failed.');
			console.log('[ERROR in Command Palette--] initializing failed.');
			this.defaultListCommandsFn = undefined;
			return;
		}

		this.inject(this.settings.inject);

		this.addCommand({
			id: LOCAL_COMMAND_ID,
			name: 'Open command palette',
			callback: () => {
				new CommandPaletteMinusModal(this.app, this).open();
			},
		});

		this.addSettingTab(new CommandPaletteMinusSettingTab(this.app, this));
	}

	override onunload() {
		this.inject(false);
	}

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

	inject(inject: boolean) {
		if (!this.defaultListCommandsFn) {
			return;
		}
		if (inject) {
			this.app.commands.listCommands = this.listCommands.bind(this);
		} else {
			this.app.commands.listCommands = this.defaultListCommandsFn;
		}
		console.log('[Command Palette--] injected:', inject);
	}

	listCommands(): Command[] {
		const settings = this.settings;
		return (
			this.defaultListCommandsFn?.()
				.filter(
					(cmd) =>
						settings.allowMode ==
						cmd.id in settings.selectedCommands
				)
				.sort((cmd1, cmd2) => {
					const usedAt1 = settings.usedCommands[cmd1.id] ?? -1;
					const usedAt2 = settings.usedCommands[cmd2.id] ?? -1;
					return usedAt2 - usedAt1;
				}) ?? []
		);
	}
}
