import {Readability as ReadabilitySax} from 'readabilitySAX';

export default class Readability extends ReadabilitySax {
  getResult() {
    return {
      title: this.getTitle(),
      text: this.getText()
    };
  }
}
