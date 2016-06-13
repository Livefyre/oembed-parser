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

const mapping = {
  opengraph: opengraphNormalizer,
  twitter: opengraphNormalizer,
  meta: metaNormalizer,
  microdata: schemaNormalizer,
  rdfa: schemaNormalizer,
  jsonld: schemaNormalizer,
  readability: readabilityNormalizer
};

const relatedProperties = {
  width: 'url',
  height: 'url',
  thumbnail_width: 'thumbnail_url',
  thumbnail_height: 'thumbnail_url',
  thumbnail_score: 'thumbnail_url'
};

const uncountedKeys = {
  thumbnail_score: true,
  video_type: true
};

const typeOrder = {
  video: 3,
  photo: 2,
  link: 1
};

export default function toOembed(data, url) {
  // Collect a list of oembeds for all of the metadata we collected
  var oembeds = [];
  for (var key in data) {
    let mapper = mapping[key];
    if (mapper && data[key]) {
      if (Array.isArray(data[key])) {
        oembeds.push(...data[key].map(item => mapper(item, url)));
      } else {
        oembeds.push(mapper(data[key], url));
      }
    }
  }
  
  oembeds = oembeds.filter(o => validateOembed(o, url));
  
  // Group oembeds by URL
  let groups = groupBy(oembeds, o => o.link || o.url);
  for (let group in groups) {
    // Starting with the oembed with the highest type, and most information, 
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
  
  if (isURL.test(oembed.author_name)) {
    delete oembed.author_name;
  }
  
  oembed.url = resolveURL(url, oembed.url);
  oembed.link = resolveURL(url, oembed.link);
  oembed.thumbnail_url = resolveURL(url, oembed.thumbnail_url);
  oembed.author_url = resolveURL(url, oembed.author_url);
  
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
    if (oembed[key] && !uncountedKeys[key]) {
      count++;
    }
  }
  return count;
}

function compareOembeds(a, b) {
  if (typeOrder[a.type] !== typeOrder[b.type]) {
    return typeOrder[b.type] - typeOrder[a.type];
  }
  
  return countValidKeys(b) - countValidKeys(a);
}

function mergeOembeds(prev, cur) {
  for (let key in cur) {
    let rel = relatedProperties[key];
    if (rel && prev[rel] && prev[rel] !== cur[rel]) {
      continue;
    }
    
    if (!prev[key] && cur[key]) {
      prev[key] = cur[key];
    }
  }
  
  // Trust thumbnails with a higher score over those with a lower one
  // (e.g. opengraph over images in the body)
  if (cur.thumbnail_url !== prev.thumbnail_url && scoreThumbnail(cur) > scoreThumbnail(prev)) {
    prev.thumbnail_url = cur.thumbnail_url;
    prev.thumbnail_width = cur.thumbnail_width;
    prev.thumbnail_height = cur.thumbnail_height;
    prev.thumbnail_score = cur.thumbnail_score;
  }

  return prev;
}

function scoreThumbnail(oembed) {
  if (!oembed.thumbnail_url) {
    return -2;
  }
  
  if (oembed.thumbnail_score) {
    return oembed.thumbnail_score;
  }
  
  // return (oembed.thumbnail_width || 0) * (oembed.thumbnail_height || 0);
  return 0;
}

function finalizeOembed(oembed) {
  if (oembed.type === 'video' && !oembed.html) {
    let video_type = oembed.video_type || (/\.mp4$/.test(oembed.url) ? 'video' : 'iframe');
    oembed.html = video_type === 'video'
      ? '<video controls src="' + oembed.url + '"></video>'
      : '<iframe src="' + oembed.url + '" allowfullscreen></iframe>';
      
    delete oembed.video_type;
  }
  
  let provider = parseDomain(oembed.provider_url || oembed.link || oembed.url);
  oembed.provider_url = 'http://' + provider.domain + '.' + provider.tld;
  
  if (!oembed.provider_name) {
    oembed.provider_name = provider.domain;
  }
  
  if (oembed.posted_at) {
    oembed.posted_at = moment.utc(oembed.posted_at).toDate();
  }
  
  if (oembed.link === oembed.url) {
    delete oembed.link;
  }
  
  delete oembed.thumbnail_score;
  
  if (typeof oembed.author_name === 'string') {
    oembed.author_name = oembed.author_name.replace(/^by\s+/i, '');
  }
  
  return oembed;
}
