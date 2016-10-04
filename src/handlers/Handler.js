import entities from 'entities';

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
    this.noscript = false;
  }

  onopentag(name, attributes) {
    if (name === 'noscript') {
      this.noscript = true;
    }

    if (this.noscript) {
      return;
    }

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
    if (this.noscript) {
      return;
    }

    if (this.stack.length) {
      for (let item of this.stack) {
        item.text += text;
      }
    }
  }

  onclosetag(tagName) {
    if (tagName === 'noscript') {
      this.noscript = false;
      return;
    }

    if (this.noscript || !this.stack.length) {
      return;
    }

    let { name, attributes, text } = this.stack.pop();
    if (badTags[name]) {
      return;
    }

    text = entities.decodeHTML(text);

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
