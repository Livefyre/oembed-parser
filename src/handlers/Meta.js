import Handler from './Handler';
import {add} from '../utils';

const OPENGRAPH_RE = /^(og|twitter):/;

export default class Meta extends Handler {
  constructor() {
    super();
    
    this.result = Object.create(null);
    this.result.title = '';
    this.result.link = Object.create(null);
  }
  
  meta(attributes) {
    let property = attributes.property || attributes.name;
    if (property && attributes.content && !OPENGRAPH_RE.test(property)) {
      add(this.result, property, attributes.content);
    }
  }
  
  link(attributes) {
    if (attributes.rel && attributes.href) {
      add(this.result.link, attributes.rel, attributes.href);
    }
  }
  
  title(attributes, text) {
    this.result.title = text;
  }
}
