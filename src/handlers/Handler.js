const badTags = {
  constructor: true,
  onopentag: true,
  ontext: true,
  onclosetag: true,
  getResult: true,
  any: true,
  anyStart: true
};

export default class Handler {
  constructor() {
    this.stack = [];
  }
  
  onopentag(name, attributes) {
    this.stack.push({ name, attributes, text: '' });
    if (badTags[name]) {
      return;
    }
    
    if (typeof this[name + 'Start'] === 'function') {
      this[name + 'Start'](attributes);
    }
    
    if (typeof this.anyStart === 'function') {
      this.anyStart(name, attributes);
    }
  }
  
  ontext(text) {
    if (this.stack.length) {
      for (let item of this.stack) {
        item.text += text;
      }
    }
  }
  
  onclosetag() {
    if (!this.stack.length) return;
    let { name, attributes, text } = this.stack.pop();
    if (badTags[name]) {
      return;
    }
    
    if (typeof this[name] === 'function') {
      this[name](attributes, text);
    }
    
    if (typeof this.any === 'function') {
      this.any(name, attributes, text);
    }
  }
  
  getResult() {
    return this.result;
  }
}
