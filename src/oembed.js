import {groupBy, values} from 'lodash';
import moment from 'moment';
import urlRegex from 'url-regex';
import parseDomain from 'parse-domain';
import URL from 'url';
import metaNormalizer from './normalizers/meta';
import opengraphNormalizer from './normalizers/opengraph';
import schemaNormalizer from './normalizers/schema';
import readabilityNormalizer from './normalizers/readability';

const isURL = urlRegex();

const MAPPERS = {
  opengraph: opengraphNormalizer,
  twitter: opengraphNormalizer,
  meta: metaNormalizer,
  microdata: schemaNormalizer,
  rdfa: schemaNormalizer,
  jsonld: schemaNormalizer,
  readability: readabilityNormalizer
};

const TYPE_SCORE = {
  video: 3,
  photo: 2,
  link: 1
};

const SOURCE_SCORE = {
  opengraph: 5,
  twitter: 4,
  microdata: 3,
  rdfa: 3,
  jsonld: 3,
  meta: 2,
  readability: 1
};

const RELATED_KEYS = {
  width: 'url',
  height: 'url',
  thumbnail_width: 'thumbnail_url',
  thumbnail_height: 'thumbnail_url'
};

const UNCOUNTED_KEYS = {
  score: true,
  video_type: true
};

const URL_KEYS = ['url', 'link', 'thumbnail_url', 'author_url'];

function applyMapper(item, url, key) {
  let res = MAPPERS[key](item, url);
  if (res) {
    res.score = ((res.score || 0) + TYPE_SCORE[res.type]) * SOURCE_SCORE[key];
  }
  
  return res;
}

export default function toOembed(data, url) {
  // Collect a list of oembeds for all of the metadata we collected
  let oembeds = [];
  for (let key in data) {
    if (MAPPERS[key] && data[key]) {
      if (Array.isArray(data[key])) {
        oembeds.push(...data[key].map(item => applyMapper(item, url, key)));
      } else {
        oembeds.push(applyMapper(data[key], url, key));
      }
    }
  }
  
  oembeds = oembeds.filter(o => validateOembed(o, url));
  
  // Group oembeds by URL
  let groups = groupBy(oembeds, o => o.link || o.url);
  for (let group in groups) {
    // Starting with the oembed with the highest score, 
    // combine info from all related oembeds.
    groups[group] = groups[group].sort(compareOembeds).reduce(mergeOembeds);
  }
  
  // Find the best of the merged results
  let res = values(groups).sort(compareOembeds)[0];
  return res ? finalizeOembed(res) : null;
}

function validateOembed(oembed, url) {
  // Require a url
  if (!oembed || !oembed.url) {
    return false;
  }
  
  for (let key in oembed) {
    let val = oembed[key];
    if (Array.isArray(val)) {
      if (val.length > 0) {
        oembed[key] = val[0];
      } else {
        delete oembed[key];
      }
    } else if (val == null) {
      delete oembed[key];
    } else if (typeof val === 'string') {
      oembed[key] = val.trim();
    }
  }
  
  // Remove author_name if it looks like a url
  if (isURL.test(oembed.author_name)) {
    delete oembed.author_name;
  }
  
  // Resolve absolute urls
  for (let key of URL_KEYS) {
    oembed[key] = resolveURL(url, oembed[key]);
  }
  
  // Parse posted_at dates
  if (oembed.posted_at) {
    let d = moment.utc(oembed.posted_at, moment.ISO_8601);
    oembed.posted_at = d.isValid() ? d.toDate() : undefined;
  }
  
  // Require at least one other key
  for (let key in oembed) {
    if (oembed[key] && key !== 'url' && key !== 'link') {
      return true;
    }
  }
  
  return false;
}

function resolveURL(from, to) {
  return to ? URL.resolve(from || 'http://', to) : undefined;
}

function countValidKeys(oembed) {
  let count = 0;
  for (let key in oembed) {
    if (oembed[key] && !UNCOUNTED_KEYS[key]) {
      count++;
    }
  }
  return count;
}

function compareOembeds(a, b) {
  return b.score - a.score;
}

function mergeOembeds(prev, cur) {
  for (let key in cur) {
    let rel = RELATED_KEYS[key];
    if (rel && prev[rel] && prev[rel] !== cur[rel]) {
      continue;
    }
    
    if (cur[key] && (!prev[key] || cur.score > prev.score)) {
      prev[key] = cur[key];
    }
  }

  return prev;
}

function finalizeOembed(oembed) {
  // Remove autoplay attribute from video urls
  if (oembed.type === 'video') {
    oembed.url = oembed.url.replace(/[\?&]autoplay=[^&]+/g, '');
  }
  
  // Generate video html if not already provided
  if (oembed.type === 'video' && !oembed.html) {
    let isVideo = oembed.video_type === 'video' || /\.mp4$/.test(URL.parse(oembed.url).pathname);
    oembed.html = isVideo
      ? '<video controls src="' + oembed.url + '"></video>'
      : '<iframe src="' + oembed.url + '" allowfullscreen></iframe>';
      
    delete oembed.video_type;
  }
  
  // Generate provider_url and provider_name
  let provider = parseDomain(oembed.provider_url || oembed.link || oembed.url);
  if (provider) {
    oembed.provider_url = 'http://' + provider.domain + '.' + provider.tld;
  
    if (!oembed.provider_name) {
      oembed.provider_name = provider.domain;
    }
  }
  
  // Remove image thumbnail if it is the same as image url
  if (oembed.type === 'photo' && oembed.thumbnail_url === oembed.url) {
    delete oembed.thumbnail_url;
    delete oembed.thumbnail_width;
    delete oembed.thumbnail_height;
  }
  
  // Remove link if it is the same as url
  if (oembed.link === oembed.url) {
    delete oembed.link;
  }
  
  // Clean up author name
  if (typeof oembed.author_name === 'string') {
    oembed.author_name = oembed.author_name.replace(/^by\s+/i, '');
  }
  
  delete oembed.score;
  return oembed;
}
