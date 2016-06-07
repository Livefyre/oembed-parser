export default class CompoundHandler {
  constructor(handlers = {}) {
    this.handlers = handlers;
  }
  
  onopentagname(name) {
    for (let handler in this.handlers) {
      if (typeof this.handlers[handler].onopentagname === 'function') {
        this.handlers[handler].onopentagname(name);
      }
    }
  }
  
  onopentag(name, attributes) {
    for (let handler in this.handlers) {
      if (typeof this.handlers[handler].onopentag === 'function') {
        this.handlers[handler].onopentag(name, attributes);
      }
    }
  }
  
  onattribute(name, value) {
    for (let handler in this.handlers) {
      if (typeof this.handlers[handler].onattribute === 'function') {
        this.handlers[handler].onattribute(name, value);
      }
    }
  }
  
  ontext(text) {
    for (let handler in this.handlers) {
      this.handlers[handler].ontext(text);
    }
  }
  
  onclosetag(name) {
    for (let handler in this.handlers) {
      this.handlers[handler].onclosetag(name);
    }
  }
  
  getResult() {
    let result = {};
    for (let handler in this.handlers) {
      result[handler] = this.handlers[handler].getResult();
    }
    
    return result;
  }
}
