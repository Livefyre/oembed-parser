export default class CompoundHandler {
  constructor(handlers = {}) {
    this.handlers = handlers;
  }
  
  _applyHandlers(name, ...args) {
    for (let key in this.handlers) {
      let handler = this.handlers[key];
      if (typeof handler[name] === 'function') {
        handler[name](...args);
      }
    }
  }
  
  onopentagname(name) {
    this._applyHandlers('onopentagname', name);
  }
  
  onopentag(name, attributes) {
    this._applyHandlers('onopentag', name, attributes);
  }
  
  onattribute(name, value) {
    this._applyHandlers('onattribute', name, value);
  }
  
  ontext(text) {
    this._applyHandlers('ontext', text);
  }
  
  onclosetag(name) {
    this._applyHandlers('onclosetag', name);
  }
  
  getResult() {
    let result = {};
    for (let handler in this.handlers) {
      result[handler] = this.handlers[handler].getResult();
    }
    
    return result;
  }
}
