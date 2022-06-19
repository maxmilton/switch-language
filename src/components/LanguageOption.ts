import { create } from 'stage1';

const optionView = create('option');

export function LanguageOption(value: string, text: string) {
  const root = optionView.cloneNode() as HTMLOptionElement;
  root.value = value;
  root.textContent = text;
  return root;
}
