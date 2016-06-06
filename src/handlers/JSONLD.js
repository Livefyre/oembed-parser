import Handler from './Handler';

export default class JSONLD extends Handler {
  constructor() {
    super();
    
    this.result = null;
  }
  
  script(attributes, text) {
    if (attributes.type === 'application/ld+json') {
      try {
        let content = JSON.parse(text);
        add(this, 'result', content);
      } catch (err) {};
    }
  }
}
