Element.prototype.num_establishContainer = function(){
  var container = this, lineCount = document.createElement("ol"), textarea = container.querySelector("textarea");
  container.insertBefore(lineCount,textarea);
  textarea.num_refreshLineCount();
  lineCount.addEventListener("mousedown",focusTextarea);
  lineCount.addEventListener("click",focusTextarea);
  textarea.wrap = "off";
  textarea.addEventListener("keydown",event => {
    if ((event.ctrlKey || event.metaKey) && (event.key == "z" || event.key == "Z" || event.key == "y")) textarea.setAttribute("data-numbered-refresh",true);
    if (event.key != "Enter" && event.key != "Backspace" && event.key != "Delete") return;
    var removedText = "", start = textarea.selectionStart, end = textarea.selectionEnd, singleCharacter = (start == end);
    if (singleCharacter){
      if (event.key == "Backspace" && start != 0) removedText = textarea.value.substring(start - 1,start);
      if (event.key == "Delete" && start != textarea.value.length) removedText = textarea.value.substring(start,start + 1);
    } else removedText = textarea.value.substring(start,end);
    if (event.key == "Enter" || removedText.includes("\n")) textarea.setAttribute("data-numbered-refresh",true);
  });
  textarea.addEventListener("cut",() => textarea.setAttribute("data-numbered-refresh",true));
  textarea.addEventListener("paste",() => textarea.setAttribute("data-numbered-refresh",true));
  textarea.addEventListener("input",() => {
    if (!textarea.hasAttribute("data-numbered-refresh")) return;
    textarea.num_refreshLineCount();
    textarea.removeAttribute("data-numbered-refresh");
  });
  textarea.addEventListener("scroll",() => textarea.num_refreshScrollPosition(),{ passive: true });
  new ResizeObserver(() => {
    if (textarea.parentElement != container) return console.error(`${textarea} is not within it's associated numbered container parent`,textarea,container);
    container.style.removeProperty("width");
    container.style.height = `${container.offsetHeight - container.clientHeight + parseInt(textarea.style.height.replace(/px/g,""))}px`;
    textarea.style.removeProperty("height");
  }).observe(textarea);
  function focusTextarea(){
    event.preventDefault();
    if (document.activeElement != textarea) textarea.focus();
  }
}
Element.prototype.num_refreshLineCount = function(){
  var textarea = this;
  if (textarea.parentElement.hasAttribute("data-numbered-hidden")) return;
  var lineCount = textarea.parentElement.querySelector("ol"), previousCount = textarea.getAttribute("data-numbered-lines");
  if (!previousCount) previousCount = 0;
  var currentCount = ((textarea.value.match(/\n/g)||[]).length + 1), countDifference = currentCount - previousCount;
  if (countDifference == 0) return;
  if (countDifference > 0){
    if (countDifference > 50){
      var fragment = new DocumentFragment();
      for (i = 0; i < countDifference; i++) fragment.appendChild(document.createElement("li"));
      lineCount.appendChild(fragment);
    } else {
      for (i = 0; i < countDifference; i++) lineCount.appendChild(document.createElement("li"));
    }
  }
  if (countDifference < 0) for (i = 0; i < Math.abs(countDifference); i++) lineCount.lastChild.remove();
  textarea.setAttribute("data-numbered-lines",currentCount);
  textarea.num_refreshScrollPosition();
}
Element.prototype.num_refreshScrollPosition = function(){
  var textarea = this, lineCount = textarea.parentElement.querySelector("ol"), scrollbarHeight = textarea.offsetHeight - textarea.clientHeight, paddingHeight = parseInt(window.getComputedStyle(lineCount).getPropertyValue("padding-top")), overflowOffset = parseInt(window.getComputedStyle(lineCount).getPropertyValue("--overflow-offset"));
  if (scrollbarHeight > 0){
    lineCount.style.setProperty("--overflow-offset",`${paddingHeight + scrollbarHeight}px`);
  } else lineCount.style.setProperty("--overflow-offset",`${paddingHeight}px`);
  lineCount.scrollTop = textarea.scrollTop;
}
Element.prototype.num_enableLineCount = function(){
  var textarea = this;
  textarea.parentElement.removeAttribute("data-numbered-hidden");
  textarea.num_refreshLineCount();
}
Element.prototype.num_disableLineCount = function(){
  var textarea = this;
  textarea.parentElement.setAttribute("data-numbered-hidden",true);
}
Element.prototype.num_toggleLineCount = function(){
  var textarea = this;
  if (textarea.parentElement.hasAttribute("data-numbered-hidden")){
    textarea.num_enableLineCount();
  } else textarea.num_disableLineCount();
}
Element.prototype.num_changeValue = function(value){
  var textarea = this;
  if (textarea.tagName.toLowerCase() != "textarea") return console.error(`${textarea} is not a valid numbered textarea`,textarea);
  if (!textarea.parentElement.hasAttribute("data-numbered-container")) return console.error(`${textarea} is not within a valid numbered container parent`,textarea);
  textarea.value = value;
  textarea.num_refreshLineCount();
}