import { createViewModel } from './Task-view-model';

export function onNavigatingTo(args) {
  const page = args.object
  page.bindingContext = createViewModel();
}
