export default class CompoundHandler {
  constructor(handlers = {}) {
    this.handlers = handlers;
  }
  
  onopentagname(name) {
    applyHandlers(this.handlers.onopentagname, name);
  }
  
  onopentag(name, attributes) {
    applyHandlers(this.handlers.onopentag, name, attributes);
  }
  
  onattribute(name, value) {
    applyHandlers(this.handlers.onattribute, name, value);
  }
  
  ontext(text) {
    applyHandlers(this.handlers.ontext, text);
  }
  
  onclosetag(name) {
    applyHandlers(this.handlers.onclosetag, name);
  }
  
  getResult() {
    let result = {};
    for (let handler in this.handlers) {
      result[handler] = this.handlers[handler].getResult();
    }
    
    return result;
  }
}

function applyHandlers(handlers, ...args) {
  for (let key in handlers) {
    let handler = handlers[key];
    if (typeof handler[name] === 'function') {
      handler[name](...args);
    }
  }
}
