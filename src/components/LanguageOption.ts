import { clone, create } from 'stage1';

export type LanguageOptionComponent = HTMLOptionElement;

const view = create('option');

export function LanguageOption(
  value: string,
  text: string,
): LanguageOptionComponent {
  const root = clone(view);
  root.value = value;
  root.textContent = text;
  return root;
}
