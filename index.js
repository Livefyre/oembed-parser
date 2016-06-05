import {WritableStream} from 'htmlparser2';
// import Parser from './src/Parser';
import Opengraph from './src/Opengraph';
import CompoundHandler from './src/CompoundHandler';
import Microdata from './src/Microdata';
import Meta from './src/Meta';
import JSONLD from './src/JSONLD';
import RDFa from './src/RDFa';

export default function createParser() {
  let handler = new CompoundHandler({
    opengraph: new Opengraph('og:'),
    twitter: new Opengraph('twitter:'),
    microdata: new Microdata,
    meta: new Meta,
    jsonld: new JSONLD,
    rdfa: new RDFa
  });
  
  return new WritableStream(handler, { decodeEntities: true });
}

import request from 'request';

// http://qz.com/596448/one-of-hong-kongs-missing-booksellers-just-reappeared-to-confess-to-an-11-year-old-crime
// http://www.cnn.com/2016/01/17/politics/bernie-sanders-health-care-plan-sotu/index.html
// https://www.youtube.com/watch?v=ti2Nokoq1J4
// https://berniesanders.com/issues/medicare-for-all/
// http://www.imdb.com/title/tt5235868/
// http://mashable.com/2016/01/17/hillary-clinton-bernie-sanders-wall-street/
// http://www.nytimes.com/video/technology/personaltech/100000004142268/fresh-from-ces.html?playlistId=1194811622182&module=tv-carousel&action=click&pgType=Multimedia&contentPlacement=0
// http://on.nba.com/1UkNMuW
// https://amp.twimg.com/v/875038d6-41b8-4768-bbbf-4f63bcfe0387
// http://snpy.tv/1Up0W9M
// https://www.periscope.tv/w/aiHMFDYyMjc4NHwxTW5HbmpkQk9yVkdPDgo9f8CSm2y9dBfSpwGYIjXyh8gwrnh3AAbTYXXzUyY=
// http://nyti.ms/28dtAFl
request('http://www.submarinecablemap.com/#/', { jar: true, maxRedirects: 100, headers: { Referer: 'https://www.google.com', 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'}})
  .pipe(createParser());
