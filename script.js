globalThis.Editor = {
  appearance: () => ({
    parent_window: (window.self == window.top)
  }),
  environment: () => ({
    apple_device: (/(Mac|iPhone|iPad|iPod)/i.test(navigator.platform)),
    macOS_device: (/(Mac)/i.test(navigator.platform) && navigator.standalone == undefined),
    electron: ("electron" in window)
  }),
  orientation: () => document.body.getAttribute("data-orientation")
};
if (Editor.environment().macOS_device) document.documentElement.classList.add("macOS-device");
if (Editor.environment().electron) window.electron.receive("refresh-maximize",refreshMaximizeControl);

document.querySelectorAll("header .window-controls .control").forEach(/** @param { HTMLButtonElement } control */(control) => {
  control.addEventListener("mousedown",event => event.preventDefault());
  control.tabIndex = -1;
  if (!Editor.environment().electron) return;
  var type = control.getAttribute("data-control");
  if (type == "minimize") control.addEventListener("click",() => window.electron.minimize());
  if (type == "maximize") control.addEventListener("click",() => (!window.electron.isMaximized()) ? window.electron.maximize() : window.electron.unmaximize());
  if (type == "close") control.addEventListener("click",() => window.electron.close());
});
document.querySelectorAll("num-text").forEach(/** @param { NumText } textarea */(textarea) => textarea.container.appendChild(document.querySelector("[data-scrollbar-styles]").cloneNode(true)));
window.addEventListener("focus",() => {
  if (document.documentElement.classList.contains("window-inactive")) document.documentElement.classList.remove("window-inactive");
});
window.addEventListener("blur",() => {
  if (!document.documentElement.classList.contains("window-inactive")) document.documentElement.classList.add("window-inactive");
});
document.body.addEventListener("keydown",event => {
                                                                                                                                                                                                                                                                              // @ts-expect-error - weird
  var pressed = key => (event.key.toLowerCase() == key.toLowerCase()), control = (event.ctrlKey && !Editor.environment().apple_device), command = (event.metaKey && Editor.environment().apple_device), shift = (event.shiftKey || ((event.key.toUpperCase() == event.key) && (event.key + event.key == event.key * 2))), controlShift = (control && shift), shiftCommand = (shift && command), controlCommand = (event.ctrlKey && command);
  if ((controlShift || shiftCommand) && pressed("c")){
    event.preventDefault();
    if (event.repeat) return;
    window.electron.createWindow();
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
workspace_editor.addEventListener("input",refreshPreview);
if (Editor.environment().electron) refreshMaximizeControl();
if (Editor.appearance().parent_window) workspace_editor.editor.focus();
function setOrientation(orientation){
  var param = (orientation);
  if (!param && Editor.orientation() == "horizontal") orientation = "vertical";
  if (!param && Editor.orientation() == "vertical") orientation = "horizontal";
  if (orientation == Editor.orientation()) return;
  document.body.classList.remove(Editor.orientation());
  document.body.setAttribute("data-orientation",orientation);
  document.body.classList.add(Editor.orientation());
}
function insertTemplate(){
  workspace_editor.value = decodeURI(`%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22${navigator.language}%22%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%7D%0A%20%20body%20%7B%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E`);
  workspace_editor.editor.setSelectionRange(0,0);
  workspace_editor.editor.focus();
  refreshPreview();
}
function refreshPreview(){
  preview.addEventListener("load",() => {
    preview.contentWindow.document.open();
    preview.contentWindow.document.write(workspace_editor.value);
    preview.contentWindow.document.close();
  },{ once: true });
  preview.src = "about:blank";
}
function refreshMaximizeControl(){
  /** @type { HTMLButtonElement } */
  var maximize = document.querySelector("header .window-controls .control[data-control='maximize']");
  maximize.querySelectorAll("[data-icon].active").forEach(icon => icon.classList.remove("active"));
  var icon = (!window.electron.isMaximized()) ? "maximize" : "restore";
  maximize.querySelector(`[data-icon="${icon}"]`).classList.add("active");
  maximize.title = icon[0].toUpperCase() + icon.slice(1);
}