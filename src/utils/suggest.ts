// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes/blob/c8b1040f9d84ec8f4b8eae4782b23c2c6bf14e0e/src/ui/suggest.ts

import { App, ISuggestOwner, Scope } from 'obsidian';
import { createPopper, Instance as PopperInstance } from '@popperjs/core';

const wrapAround = (value: number, size: number): number => {
	return ((value % size) + size) % size;
};

class Suggest<T> {
	private owner: ISuggestOwner<T>;
	private values: T[] = [];
	private suggestions: HTMLElement[] = [];
	private selectedItem = 0;
	private containerEl: HTMLElement;

	constructor(
		owner: ISuggestOwner<T>,
		containerEl: HTMLElement,
		scope: Scope
	) {
		this.owner = owner;
		this.containerEl = containerEl;

		containerEl.on(
			'click',
			'.suggestion-item',
			this.onSuggestionClick.bind(this)
		);
		containerEl.on(
			'mousemove',
			'.suggestion-item',
			this.onSuggestionMouseover.bind(this)
		);

		scope.register([], 'ArrowUp', (event) => {
			if (!event.isComposing) {
				this.setSelectedItem(this.selectedItem - 1, true);
				return false;
			}
			return false;
		});
		scope.register(['Ctrl'], 'p', (event) => {
			if (!event.isComposing) {
				this.setSelectedItem(this.selectedItem - 1, true);
			}
			return false;
		});

		scope.register([], 'ArrowDown', (event) => {
			if (!event.isComposing) {
				this.setSelectedItem(this.selectedItem + 1, true);
				return false;
			}
			return false;
		});
		scope.register(['Ctrl'], 'n', (event) => {
			if (!event.isComposing) {
				this.setSelectedItem(this.selectedItem + 1, true);
				return false;
			}
			return false;
		});

		scope.register([], 'Enter', (event) => {
			if (!event.isComposing) {
				this.useSelectedItem(event);
				return false;
			}
			return false;
		});
	}

	onSuggestionClick(event: MouseEvent, el: HTMLElement): void {
		event.preventDefault();

		const item = this.suggestions.indexOf(el);
		this.setSelectedItem(item, false);
		this.useSelectedItem(event);
	}

	onSuggestionMouseover(_event: MouseEvent, el: HTMLElement): void {
		const item = this.suggestions.indexOf(el);
		this.setSelectedItem(item, false);
	}

	setSuggestions(values: T[]) {
		this.containerEl.empty();
		const suggestionEls: HTMLDivElement[] = [];

		values.forEach((value) => {
			const suggestionEl = this.containerEl.createDiv('suggestion-item');
			this.owner.renderSuggestion(value, suggestionEl);
			suggestionEls.push(suggestionEl);
		});

		this.values = values;
		this.suggestions = suggestionEls;
		this.setSelectedItem(0, false);
	}

	useSelectedItem(event: MouseEvent | KeyboardEvent) {
		const currentValue = this.values[this.selectedItem];
		if (currentValue) {
			this.owner.selectSuggestion(currentValue, event);
		}
	}

	setSelectedItem(selectedIndex: number, scrollIntoView: boolean) {
		const normalizedIndex = wrapAround(
			selectedIndex,
			this.suggestions.length
		);
		const prevSelectedSuggestion = this.suggestions[this.selectedItem];
		const selectedSuggestion = this.suggestions[normalizedIndex];

		prevSelectedSuggestion?.removeClass('is-selected');
		selectedSuggestion?.addClass('is-selected');

		this.selectedItem = normalizedIndex;

		if (scrollIntoView) {
			selectedSuggestion?.scrollIntoView(false);
		}
	}
}

export abstract class TextInputSuggest<T> implements ISuggestOwner<T> {
	protected app: App;
	protected inputEl: HTMLInputElement | HTMLTextAreaElement;

	private popper: PopperInstance | undefined;
	private scope: Scope;
	private suggestEl: HTMLElement;
	private suggest: Suggest<T>;

	constructor(app: App, inputEl: HTMLInputElement | HTMLTextAreaElement) {
		this.app = app;
		this.inputEl = inputEl;
		this.scope = new Scope();

		this.suggestEl = createDiv('suggestion-container');
		const suggestion = this.suggestEl.createDiv('suggestion');
		this.suggest = new Suggest(this, suggestion, this.scope);

		this.scope.register([], 'Escape', this.close.bind(this));

		this.inputEl.addEventListener('input', this.onInputChanged.bind(this));
		this.inputEl.addEventListener('focus', this.onInputChanged.bind(this));
		this.inputEl.addEventListener('blur', this.close.bind(this));
		this.suggestEl.on(
			'mousedown',
			'.suggestion-container',
			(event: MouseEvent) => {
				event.preventDefault();
			}
		);
	}

	onInputChanged(): void {
		const inputStr = this.inputEl.value;
		const suggestions = this.getSuggestions(inputStr);

		if (!suggestions) {
			this.close();
			return;
		}

		if (suggestions.length > 0) {
			this.suggest.setSuggestions(suggestions);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			this.open((<any>this.app).dom.appContainerEl, this.inputEl);
		} else {
			this.close();
		}
	}

	open(container: HTMLElement, inputEl: HTMLElement): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(<any>this.app).keymap.pushScope(this.scope);

		container.appendChild(this.suggestEl);
		this.popper = createPopper(inputEl, this.suggestEl, {
			placement: 'bottom-start',
			modifiers: [
				{
					name: 'sameWidth',
					enabled: true,
					fn: ({ state, instance }) => {
						// Note: positioning needs to be calculated twice -
						// first pass - positioning it according to the width of the popper
						// second pass - position it with the width bound to the reference element
						// we need to early exit to avoid an infinite loop
						const targetWidth = `${state.rects.reference.width}px`;
						const p = state.styles['popper'];
						if (p === undefined) {
							return;
						}
						if (p.width === targetWidth) {
							return;
						}
						p.width = targetWidth;
						instance.update();
					},
					phase: 'beforeWrite',
					requires: ['computeStyles'],
				},
			],
		});
	}

	close(): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(<any>this.app).keymap.popScope(this.scope);

		this.suggest.setSuggestions([]);
		if (this.popper) this.popper.destroy();
		this.suggestEl.detach();
	}

	abstract getSuggestions(_inputStr: string): T[];
	abstract renderSuggestion(_item: T, _el: HTMLElement): void;
	abstract selectSuggestion(_item: T): void;
}
