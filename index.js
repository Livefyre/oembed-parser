import {WritableStream} from 'htmlparser2';
// import Parser from './src/Parser';
import Opengraph from './src/handlers/Opengraph';
import CompoundHandler from './src/handlers/CompoundHandler';
import Microdata from './src/handlers/Microdata';
import Meta from './src/handlers/Meta';
import JSONLD from './src/handlers/JSONLD';
import RDFa from './src/handlers/RDFa';

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
// http://bloom.bg/1T6RWFS
// http://hill.cm/TS4BItV
// http://53eig.ht/1RkcdH1
// http://venturebeat.com/2016/03/01/livefyre-upgrades-storify-to-enable-large-newsrooms-to-post-real-time-stories-quickly/
// http://tnw.me/rtc9jlU
// https://news.vice.com/article/edward-snowden-leaks-tried-to-tell-nsa-about-surveillance-concerns-exclusive
request('http://es.pn/25GooYn', { jar: true, maxRedirects: 100, headers: { Referer: 'https://www.google.com', 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'}})
  .pipe(createParser());
