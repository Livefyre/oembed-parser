import {groupBy} from 'lodash';
import moment from 'moment';
import urlRegex from 'url-regex';
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
  
  console.log(oembeds);
  
  // Group oembeds by type
  let types = groupBy(oembeds.filter(validateOembed), 'type');
  for (let type in types) {
    // Starting with the oembed with the most information, combine info
    // from all oembeds of the same type.
    types[type] = types[type].sort(compareOembeds).reduce((prev, cur) => {
      // Ensure we're talking about the same object
      if (cur.url !== prev.url) return prev;
      
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
    });
  }
  
  let res = types.video || types.image || types.link;
  
  return res ? finalizeOembed(res) : null;
}

function validateOembed(oembed) {
  // Require a url
  if (!oembed || !oembed.url) {
    return false;
  }
  
  if (isURL.test(oembed.author_name)) {
    delete oembed.author_name;
  }
  
  // Require at least one other key
  for (let key in oembed) {
    if (oembed[key] && key !== 'url' && key !== 'link') {
      return true;
    }
  }
  
  return false;
}

function countValidKeys(oembed) {
  let count = 0;
  for (let key in oembed) {
    if (oembed[key]) {
      count++;
    }
  }
  return count;
}

function compareOembeds(a, b) {
  return countValidKeys(b) - countValidKeys(a);
}

function scoreThumbnail(oembed) {
  if (!oembed.thumbnail_url) {
    return -2;
  }
  
  if (oembed.thumbnail_score) {
    return oembed.thumbnail_score;
  }
  
  return !!oembed.thumbnail_width + !!oembed.thumbnail_height;
}

function finalizeOembed(oembed) {
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
    }
  }
  
  oembed.url = url(oembed.url);
  oembed.link = url(oembed.link);
  oembed.thumbnail_url = url(oembed.thumbnail_url);
  
  if (oembed.type === 'video' && !oembed.html) {
    oembed.html = /\.mp4$/.test(oembed.url) 
      ? '<video controls src="' + oembed.url + '"></video>'
      : '<iframe src="' + oembed.url + '" allowfullscreen></iframe>';
  }
  
  let provider = getProvider(oembed.link || oembed.url);
  if (!oembed.provider_url) {
    oembed.provider_url = 'http://' + provider.join('.');
  }
  
  if (!oembed.provider_name) {
    oembed.provider_name = provider[0];
  }
  
  if (oembed.posted_at) {
    oembed.posted_at = moment.utc(oembed.posted_at).toDate();
  }
  
  if (oembed.link === oembed.url) {
    delete oembed.link;
  }
  
  delete oembed.thumbnail_score;
  return oembed;
}

function url(str) {
  if (str && /^\/\//.test(str)) {
    str = 'http:' + str;
  }
  
  return str;
}

function getProvider(url) {
  if (!url) return '';

  return url
    .replace(/^(https?:\/\/)(www\.)?/i,'')
    .replace(/\/.*/g, '')
    .split('.')
    .slice(-2);
}
