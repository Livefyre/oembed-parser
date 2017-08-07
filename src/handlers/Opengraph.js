import Handler from './Handler';
import {add, setKey} from '../utils';

var rootKeys = {
  'image': 'image:url',
  'video': 'video:url',
  'audio': 'audio:url',
  'player': 'player:url',
  'player:stream': 'player:stream:url',
  'site': 'site:name',
  'music:song': 'music:song:url'
};

export default class Opengraph extends Handler {
  constructor(prefix = 'og:', subtypes) {
    super();

    this.prefix = prefix;
    this.subtypes = subtypes;
    this.result = Object.create(null);
  }

  meta(attributes) {
    let property = attributes.property || attributes.name;
    if (this.subtypes && this.subtypes.test(property)) {
      property = this.prefix + property;
    }

    if (property && attributes.content && property.indexOf(this.prefix) === 0) {
      let k = property.slice(this.prefix.length);
      k = rootKeys[k] || k;
      setKey(this.result, k.split(':'), attributes.content);
    }
  }
}
