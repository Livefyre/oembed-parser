import Handler from './Handler';
import {add} from '../utils';

const OPENGRAPH_RE = /^(og|twitter):/;

export default class Meta extends Handler {
  constructor() {
    super();
    
    this.result = Object.create(null);
    this.result.title = '';
    this.result.link = Object.create(null);
    this.result.images = [];
  }
  
  meta(attributes) {
    let property = attributes.property || attributes.name || attributes['http-equiv'];
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
  
  img(attributes) {
    if (attributes.src && !/data:/.test(attributes.src)) {
      this.result.images.push(attributes);
    }
  }
  
  a(attributes, text) {
    if (attributes.rel === 'author') {
      add(this.result.link, 'author', attributes.href);
      add(this.result, 'author', text);
    }
  }
}
