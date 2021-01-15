window.Editor = {
  environment: () => ({
    macOS_device: (/(Mac)/i.test(navigator.platform) && navigator.standalone == undefined)
  })
};
window.mainProcess.receive("refresh-maximize",refreshMaximizeControl);
document.querySelectorAll("[data-numbered-container]").forEach(container => container.num_establishContainer());
document.body.addEventListener("keydown",event => {
  var pressed = key => (event.key.toLowerCase() == key.toLowerCase()), ctrl = (event.ctrlKey && !Editor.environment().apple_device), command = (event.metaKey && Editor.environment().apple_device), shift = (event.shiftKey || ((event.key.toUpperCase() == event.key) && (event.key + event.key == event.key * 2))), ctrlShift = (ctrl && shift), shiftCommand = (shift && command), ctrlCommand = (event.ctrlKey && command);
  if ((ctrlShift || shiftCommand) && pressed("c")){
    event.preventDefault();
    if (event.repeat) return;
    window.mainProcess.createWindow();
  }
  if ((ctrlShift || ctrlCommand) && (pressed("5") || pressed("%"))){
    event.preventDefault();
    if (event.repeat) return;
    changeOrientation();
  }
  if ((ctrlShift || shiftCommand) && pressed("h")){
    event.preventDefault();
    if (event.repeat) return;
    insertMarkupTemplate();
  }
});
window_controls.querySelectorAll(".control").forEach(control => control.setAttribute("tabindex","-1"));
minimize_control.addEventListener("click",() => window.mainProcess.minimize());
maximize_control.addEventListener("click",() => {
  if (!window.mainProcess.isMaximized()){
    window.mainProcess.maximize();
  } else window.mainProcess.unmaximize();
});
close_control.addEventListener("click",() => window.mainProcess.close());
workspace_input.addEventListener("input",refreshPreview);
refreshMaximizeControl();
if (window.self == window.top) workspace_input.focus();
function changeOrientation(){
  if (!document.body.classList.contains("vertical")){
    document.body.classList.add("vertical");
  } else document.body.classList.remove("vertical");
}
function insertMarkupTemplate(){
  workspace_input.num_changeValue(decodeURI("%3C!DOCTYPE%20html%3E%0A%3Chtml%20lang=%22en-US%22%3E%0A%0A%3Chead%3E%0A%0A%3Ctitle%3E%3C/title%3E%0A%3Cmeta%20charset=%22UTF-8%22%3E%0A%3Cmeta%20name=%22viewport%22%20content=%22width=device-width,%20initial-scale=1%22%3E%0A%0A%3Cstyle%3E%0A%20%20*,%20*::before,%20*::after%20%7B%0A%20%20%20%20box-sizing:%20border-box;%0A%20%20%20%20font-family:%20sans-serif;%0A%20%20%7D%0A%3C/style%3E%0A%0A%3C/head%3E%0A%0A%3Cbody%3E%0A%0A%3Cscript%3E%0A%3C/script%3E%0A%0A%3C/body%3E%0A%0A%3C/html%3E"));
  refreshPreview();
}
function refreshPreview(){
  workspace_preview.contentWindow.document.open();
  workspace_preview.contentWindow.document.write(workspace_input.value);
  workspace_preview.contentWindow.document.close();
}
function refreshMaximizeControl(){
  maximize_control.querySelectorAll("[data-icon]").forEach(icon => icon.classList.remove("active"));
  var icon;
  if (!window.mainProcess.isMaximized()){
    icon = "maximize";
  } else icon = "restore-down";
  maximize_control.querySelector(`[data-icon="${icon}"]`).classList.add("active");
}