import Handler from './Handler';
import {add} from './utils';

export default class RDFa extends Handler {
  constructor() {
    super();
    this.rdfaStack = [];
    this.result = null;
  }
  
  anyStart(name, attributes) {
    let type = attributes.typeOf || attributes.typeof;
    if (type != null) {
      let item = Object.create(null);
      item['@type'] = type;
      
      if (this.rdfaStack.length && attributes.property) {
        add(this.rdfaStack[this.rdfaStack.length - 1], attributes.property, item);
      }
      
      this.rdfaStack.push(item);
    }
  }
  
  any(name, attributes, text) {
    let type = attributes.typeOf || attributes.typeof;
    if (type != null && this.rdfaStack.length) {
      let item = this.rdfaStack.pop();
      if (this.rdfaStack.length === 0) {
        add(this, 'result', item)
      }
      
      return;
    }
    
    if (attributes.property && this.rdfaStack.length) {
      let item = this.rdfaStack[this.rdfaStack.length - 1];
      let value = attributes.src || attributes.href || attributes.content || attributes.datetime || text;
      
      add(item, attributes.property, value);
    }
  }
}
