import Handler from './Handler';
import {add, makeArray, setKey} from './utils';

var rootKeys = {
  'image': 'image:url',
  'video': 'video:url',
  'audio': 'audio:url',
  'player': 'player:url',
  'site': 'site:name'
};

export default class Opengraph extends Handler {
  constructor(prefix = 'og:') {
    super();
    
    this.prefix = prefix;
    this.result = Object.create(null);
  }
  
  meta(attributes) {
    let property = attributes.property || attributes.name;
    if (property && attributes.content && property.indexOf(this.prefix) === 0) {
      let k = property.slice(this.prefix.length);
      k = rootKeys[k] || k;
      setKey(this.result, k.split(':'), attributes.content);
    }
  }
}
