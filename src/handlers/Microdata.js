import Handler from './Handler';
import {add} from '../utils';

export default class Microdata extends Handler {
  constructor() {
    super();
    this.microdataStack = [];
    this.result = null;
  }
  
  anyStart(name, attributes) {    
    if (attributes.itemscope != null) {
      let item = Object.create(null);
      
      if (attributes.itemtype) {
        item['@type'] = attributes.itemtype;
      }
      
      if (this.microdataStack.length && attributes.itemprop) {
        for (let prop of attributes.itemprop.split(/\s+/)) {
          add(this.microdataStack[this.microdataStack.length - 1], prop, item);
        }
      }
      
      this.microdataStack.push(item);
    }
  }
  
  any(name, attributes, text) {
    if (attributes.itemscope != null && this.microdataStack.length) {
      let item = this.microdataStack.pop();
      if (this.microdataStack.length === 0) {
        add(this, 'result', item)
      }
      
      return;
    }
    
    if (attributes.itemprop && this.microdataStack.length) {
      let item = this.microdataStack[this.microdataStack.length - 1];
      let value = attributes.src || attributes.href || attributes.content || attributes.datetime || text;
      
      for (let prop of attributes.itemprop.split(/\s+/)) {
        add(item, prop, value);
      }
    }
  }
  
  a(attributes, text) {
    let item = this.microdataStack[this.microdataStack.length - 1];
    if (item && attributes.href && !attributes.itemprop && !item.href) {
      item.href = attributes.href;
    }
  }
}
