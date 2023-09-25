import { Menu } from "electron";

import type { MenuItemConstructorOptions } from "electron";

const isMac = process.platform === "darwin";

const template: MenuItemConstructorOptions[] = [
  ...(isMac
    ? [{ role: "appMenu" } satisfies MenuItemConstructorOptions]
    : []
  ),
  { role: "fileMenu" },
  { role: "editMenu" },
  { role: "viewMenu" },
  { role: "windowMenu" }
];

export const menu = Menu.buildFromTemplate(template);