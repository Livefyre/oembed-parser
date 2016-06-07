import {WritableStream} from 'htmlparser2';
import Opengraph from './handlers/Opengraph';
import CompoundHandler from './handlers/CompoundHandler';
import Microdata from './handlers/Microdata';
import Meta from './handlers/Meta';
import JSONLD from './handlers/JSONLD';
import RDFa from './handlers/RDFa';
import toOembed from './OembedNormalizer';
import {Readability} from 'readabilitySAX';

export default class Parser extends WritableStream {
  constructor(url) {
    let readability = new Readability;
    readability.getResult = () => readability.getArticle('text');
    
    let handler = new CompoundHandler({
      opengraph: new Opengraph('og:'),
      twitter: new Opengraph('twitter:'),
      microdata: new Microdata,
      meta: new Meta,
      jsonld: new JSONLD,
      rdfa: new RDFa,
      readability: readability
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
