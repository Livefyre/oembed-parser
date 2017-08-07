import {WritableStream} from 'htmlparser2';
import Opengraph from './handlers/Opengraph';
import CompoundHandler from './handlers/CompoundHandler';
import Microdata from './handlers/Microdata';
import Meta from './handlers/Meta';
import JSONLD from './handlers/JSONLD';
import RDFa from './handlers/RDFa';
import Readability from './handlers/Readability';
import toOembed from './oembed';

export default class Parser extends WritableStream {
  constructor(url) {
    let handler = new CompoundHandler({
      opengraph: new Opengraph('og:', /^(music|article):/),
      twitter: new Opengraph('twitter:'),
      microdata: new Microdata,
      meta: new Meta,
      jsonld: new JSONLD,
      rdfa: new RDFa,
      readability: new Readability
    });

    super(handler, {decodeEntities: true});
    this.handler = handler;
    this.url = url;
  }

  getData() {
    return this.handler.getResult();
  }

  getOembed() {
    return toOembed(this.getData(), this.url);
  }
}
