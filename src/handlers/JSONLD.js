import Handler from './Handler';
import {add} from '../utils';
import entities from 'entities';

export default class JSONLD extends Handler {
  constructor() {
    super();

    this.result = null;
  }

  script(attributes, text) {
    if (attributes.type === 'application/ld+json') {
      try {
        let content = decodeEntities(JSON.parse(text));
        add(this, 'result', content);
      } catch (err) {};
    }
  }
}

function decodeEntities(obj) {
  if (typeof obj === 'string') {
    return entities.decodeHTML(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(decodeEntities);
  } else if (obj && typeof obj === 'object') {
    let res = {};
    for (let key in obj) {
      res[key] = decodeEntities(obj[key]);
    }

    return res;
  }

  return obj;
}