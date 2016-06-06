import {WritableStream} from 'htmlparser2';
import Opengraph from './handlers/Opengraph';
import CompoundHandler from './handlers/CompoundHandler';
import Microdata from './handlers/Microdata';
import Meta from './handlers/Meta';
import JSONLD from './handlers/JSONLD';
import RDFa from './handlers/RDFa';
import toOembed from './OembedNormalizer';

export default class Parser extends WritableStream {
  constructor() {
    let handler = new CompoundHandler({
      opengraph: new Opengraph('og:'),
      twitter: new Opengraph('twitter:'),
      microdata: new Microdata,
      meta: new Meta,
      jsonld: new JSONLD,
      rdfa: new RDFa
    });
    
    super(handler, {decodeEntities: true});
    this.handler = handler;
  }
  
  getData() {
    return this.handler.getResult();
  }
  
  getOembed() {
    return toOembed(this.getData());
  }
}
