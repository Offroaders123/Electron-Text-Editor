class NumText extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback(){
    this.addEventListener("mousedown",event => {
      event.preventDefault();
      if (document.activeElement != this.editor) this.editor.focus();
    });
    this.styles = document.createElement("link");
    this.styles.rel = "stylesheet";
    this.styles.href = "num-text/styles.css";
    this.container = document.createElement("div");
    this.container.part = "container";
    this.gutter = document.createElement("ol");
    this.gutter.part = "gutter";
    this.gutter.addEventListener("mousedown",event => {
      event.preventDefault();
      event.stopPropagation();
      if (event.button != 0) return;
      var index = Array.from(this.gutter.children).indexOf(event.target);
      var line = indexi("\n",this.editor.value)[index - 1];
      this.editor.setSelectionRange(line,line);
      this.editor.blur();
      this.editor.focus();
      function indexi(char,str){
        var list = [], i = -1;
        while ((i = str.indexOf(char,i + 1)) >= 0) list.push(i + 1);
        return list;
      }
    });
    this.gutter.addEventListener("contextmenu",event => event.preventDefault());
    this.gutter.addEventListener("scroll",() => this.refreshScrollPosition(),{ passive: true });
    this.content = document.createElement("div");
    this.content.part = "content";
    this.editor = document.createElement("textarea");
    this.editor.part = "editor";
    this.editor.placeholder = this.getAttribute("placeholder") || "";
    this.editor.wrap = "off";
    this.editor.spellcheck = false;
    this.editor.autocomplete = "off";
    this.editor.autocapitalize = "off";
    this.editor.setAttribute("autocorrect","off");
    this.editor.addEventListener("mousedown",event => event.stopPropagation());
    this.editor.addEventListener("input",() => this.refreshLineNumbers());
    this.editor.addEventListener("scroll",() => this.refreshScrollPosition(),{ passive: true });
    new ResizeObserver(() => {
      this.style.removeProperty("width");
      this.style.height = `${this.offsetHeight - this.clientHeight + parseInt(this.editor.style.height,10)}px`;
      this.editor.style.removeProperty("height");
      this.refreshScrollPosition();
    }).observe(this.editor);
    this.shadowRoot.appendChild(this.container);
    this.container.appendChild(this.styles);
    this.container.appendChild(this.gutter);
    this.container.appendChild(this.content);
    this.content.appendChild(this.editor);
    this.disabled = this.matches("[disabled]");
    this.editor.value = this.getAttribute("value") || "";
    this.editor.setSelectionRange(0,0);
    this.refreshLineNumbers();
  }
  refreshLineNumbers(){
    var previousCount = this.editor.getAttribute("data-line-count") || 0,
      count = (this.editor.value.match(/\n/g) || []).length + 1,
      difference = count - previousCount;
    if (difference == 0) return;
    if (difference > 0){
      var fragment = new DocumentFragment(), lineNumber = document.createElement("li");
      lineNumber.part = "line-number";
      for (var i = 0; i < difference; i++) fragment.appendChild(lineNumber.cloneNode());
      this.gutter.appendChild(fragment);
    }
    if (difference < 0) for (var i = 0; i < Math.abs(difference); i++) this.gutter.lastChild.remove();
    this.editor.setAttribute("data-line-count",count);
    this.refreshScrollPosition();
  }
  refreshScrollPosition(){
    var { offsetWidth, offsetHeight, clientWidth, clientHeight, scrollWidth, scrollHeight, scrollLeft, scrollTop } = this.editor;
    var scrollbarWidth = offsetWidth - clientWidth,
      scrollbarHeight = offsetHeight - clientHeight,
      overscrollX = (scrollLeft < 0 || (clientWidth + scrollLeft) > scrollWidth) ? (scrollLeft < 0) ? scrollLeft : (clientWidth + scrollLeft) - scrollWidth : false,
      overscrollY = (scrollTop < 0 || (clientHeight + scrollTop) > scrollHeight) ? (scrollTop < 0) ? scrollTop : (clientHeight + scrollTop) - scrollHeight : false;
    if (scrollbarWidth > 0){
      this.container.style.setProperty("--overflow-offset-x",`${scrollbarWidth}px`);
    } else this.container.style.removeProperty("--overflow-offset-x");
    if (scrollbarHeight > 0){
      this.container.style.setProperty("--overflow-offset-y",`${scrollbarHeight}px`);
    } else this.container.style.removeProperty("--overflow-offset-y");
    if (overscrollX == false){
      this.container.style.removeProperty("--overscroll-left");
      this.container.style.removeProperty("--overscroll-right");
    } else (overscrollX < 0) ? this.container.style.setProperty("--overscroll-left",`${Math.abs(overscrollX)}px`) : this.container.style.setProperty("--overscroll-right",`${overscrollX}px`);
    if (overscrollY == false){
      this.container.style.removeProperty("--overscroll-top");
      this.container.style.removeProperty("--overscroll-bottom");
    } else (overscrollY < 0) ? this.container.style.setProperty("--overscroll-top",`${Math.abs(overscrollY)}px`) : this.container.style.setProperty("--overscroll-bottom",`${overscrollY}px`);
    if (this.gutter.scrollTop != this.editor.scrollTop) this.gutter.scrollTop = this.editor.scrollTop;
  }
  get value(){
    return this.editor.value;
  }
  set value(text){
    var active = document.activeElement;
    this.editor.focus();
    this.editor.select();
    document.execCommand("insertText",null,text);
    active.focus();
    return text;
  }
  get disabled(){
    return this.editor.disabled;
  }
  set disabled(state){
    (state) ? this.setAttribute("disabled",true) : this.removeAttribute("disabled");
    this.editor.disabled = state;
  }
}
window.customElements.define("num-text",NumText);