window.Editor = {
  environment: () => ({
    macOS_device: (/(Mac)/i.test(navigator.platform) && navigator.standalone == undefined)
  })
};
window.mainProcess.receive("refresh-maximize",refreshMaximizeControl);
document.querySelectorAll("[data-numbered-container]").forEach(container => container.num_establishContainer());
document.querySelectorAll("header .window-controls .control").forEach(control => {
  var controlType = control.getAttribute("data-control");
  if (controlType == "minimize") control.addEventListener("click",() => window.mainProcess.minimize());
  if (controlType == "maximize") control.addEventListener("click",() => {
    if (!window.mainProcess.isMaximized()){
      window.mainProcess.maximize();
    } else window.mainProcess.unmaximize();
  });
  if (controlType == "close") control.addEventListener("click",() => window.mainProcess.close());
  control.setAttribute("tabindex","-1");
});
document.body.addEventListener("keydown",event => {
  var pressed = key => (event.key.toLowerCase() == key.toLowerCase()), control = (event.ctrlKey && !Editor.environment().apple_device), command = (event.metaKey && Editor.environment().apple_device), shift = (event.shiftKey || ((event.key.toUpperCase() == event.key) && (event.key + event.key == event.key * 2))), controlShift = (control && shift), shiftCommand = (shift && command), controlCommand = (event.ctrlKey && command);
  if ((controlShift || shiftCommand) && pressed("c")){
    event.preventDefault();
    if (event.repeat) return;
    window.mainProcess.createWindow();
  }
  if ((controlShift || controlCommand) && (pressed("4") || pressed("$"))){
    event.preventDefault();
    if (event.repeat) return;
    setOrientation();
  }
  if ((controlShift || shiftCommand) && pressed("h")){
    event.preventDefault();
    if (event.repeat) return;
    insertMarkupTemplate();
  }
});
workspace_editor.addEventListener("input",refreshPreview);
refreshMaximizeControl();
if (window.self == window.top) workspace_editor.focus();
function setOrientation(){
  if (document.body.getAttribute("data-orientation") != "horizontal"){
    document.body.setAttribute("data-orientation","horizontal");
  } else document.body.setAttribute("data-orientation","vertical");
}
function insertMarkupTemplate(){
  workspace_editor.num_changeValue(decodeURI("%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22en-US%22%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E"));
  refreshPreview();
}
function refreshPreview(){
  workspace_preview.contentWindow.document.open();
  workspace_preview.contentWindow.document.write(workspace_editor.value);
  workspace_preview.contentWindow.document.close();
}
function refreshMaximizeControl(){
  var maximizeControl = document.querySelector("header .window-controls .control[data-control='maximize']");
  maximizeControl.querySelectorAll("[data-icon]").forEach(icon => icon.classList.remove("active"));
  var icon;
  if (!window.mainProcess.isMaximized()){
    icon = "maximize";
  } else icon = "restore-down";
  maximizeControl.querySelector(`[data-icon="${icon}"]`).classList.add("active");
}