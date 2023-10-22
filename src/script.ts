type Orientation = "horizontal" | "vertical";
type WindowControl = "minimize" | "maximize" | "close";

const Editor = {
  appearance: {
    get parent_window(): boolean {
      return window.self === window.top;
    }
  },
  environment: {
    get apple_device(): boolean {
      return /(Mac|iPhone|iPad|iPod)/i.test(navigator.platform);
    },
    get macOS_device(): boolean {
      return /(Mac)/i.test(navigator.platform) && navigator.standalone === undefined;
    },
    get electron(): boolean {
      return "electron" in window;
    }
  },
  get orientation(): Orientation {
    return document.body.getAttribute("data-orientation") as Orientation;
  }
};

if (Editor.environment.macOS_device){
  document.documentElement.classList.add("macOS-device");
}
if (Editor.environment.electron){
  electron.receive("refresh-maximize",() => {
    refreshMaximizeControl();
  });
}

for (const control of document.querySelectorAll<HTMLButtonElement>("header .window-controls .control")){
  control.addEventListener("mousedown",event => {
    event.preventDefault();
  });
  control.tabIndex = -1;
  if (!Editor.environment.electron) continue;

  const type = control.getAttribute("data-control") as WindowControl;

  switch (type){
    case "minimize": {
      control.addEventListener("click",() => {
        electron.minimize();
      });
      break;
    };
    case "maximize": {
      control.addEventListener("click",() => {
        electron.isMaximized() ? electron.unmaximize() : electron.maximize();
      });
      break;
    };
    case "close": {
      control.addEventListener("click",() => {
        electron.close();
      });
      break;
    };
  }
}

for (const textarea of document.querySelectorAll("num-text")){
  textarea.themes.remove("vanilla-appearance");
  textarea.container.appendChild(document.querySelector("[data-scrollbar-styles]")!.cloneNode(true));
}

window.addEventListener("focus",() => {
  if (document.documentElement.classList.contains("window-inactive")){
    document.documentElement.classList.remove("window-inactive");
  }
});

window.addEventListener("blur",() => {
  if (!document.documentElement.classList.contains("window-inactive")){
    document.documentElement.classList.add("window-inactive");
  }
});

document.body.addEventListener("keydown",event => {
  const pressed = (key: string): boolean => (event.key.toLowerCase() === key.toLowerCase());
  const control: boolean = (event.ctrlKey && !Editor.environment.apple_device);
  const command: boolean = (event.metaKey && Editor.environment.apple_device);
                                                                              // @ts-expect-error - weird
  const shift: boolean = (event.shiftKey || ((event.key.toUpperCase() == event.key) && (event.key + event.key == event.key * 2)));
  const controlShift: boolean = (control && shift);
  const shiftCommand: boolean = (shift && command);
  const controlCommand: boolean = (event.ctrlKey && command);

  if ((controlShift || shiftCommand) && pressed("c")){
    event.preventDefault();
    if (event.repeat) return;
    electron.createWindow();
  }
  if ((controlShift || controlCommand) && (pressed("4") || pressed("$"))){
    event.preventDefault();
    if (event.repeat) return;
    setOrientation();
  }
  if ((controlShift || shiftCommand) && pressed("h")){
    event.preventDefault();
    if (event.repeat) return;
    insertTemplate();
  }
});

workspace_editor.addEventListener("input",() => {
  refreshPreview();
});

if (Editor.environment.electron){
  refreshMaximizeControl();
}
if (Editor.appearance.parent_window){
  workspace_editor.editor.focus();
}

function setOrientation(orientation?: Orientation): void {
  if (orientation === Editor.orientation) return;

  if (orientation === undefined){
    switch (Editor.orientation){
      case "horizontal": orientation = "vertical"; break;
      case "vertical": orientation = "horizontal"; break;
    }
  }

  document.body.classList.remove(Editor.orientation);
  document.body.setAttribute("data-orientation",orientation);
  document.body.classList.add(Editor.orientation);
}

function insertTemplate(): void {
  workspace_editor.value = decodeURI(`%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22${navigator.language}%22%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%7D%0A%20%20body%20%7B%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E`);
  workspace_editor.editor.setSelectionRange(0,0);
  workspace_editor.editor.focus();
  refreshPreview();
}

async function refreshPreview(): Promise<void> {
  await new Promise((resolve,reject) => {
    preview.addEventListener("load",resolve,{ once: true });
    preview.addEventListener("error",reject,{ once: true });
    preview.src = "about:blank";
  });
  preview.contentWindow!.document.open();
  preview.contentWindow!.document.write(workspace_editor.value);
  preview.contentWindow!.document.close();
}

function refreshMaximizeControl(): void {
  type MaximizeIcon = "maximize" | "restore";

  const maximize = document.querySelector<HTMLButtonElement>("header .window-controls .control[data-control='maximize']")!;
  const icon: MaximizeIcon = electron.isMaximized() ? "restore" : "maximize";

  for (const icon of maximize.querySelectorAll<HTMLSpanElement>("[data-icon].active")){
    icon.classList.remove("active");
  }

  maximize.querySelector(`[data-icon="${icon}"]`)!.classList.add("active");
  maximize.title = `${icon[0]!.toUpperCase()}${icon.slice(1)}`;
}