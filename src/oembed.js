import {groupBy} from 'lodash';
import metaNormalizer from './normalizers/meta';
import opengraphNormalizer from './normalizers/opengraph';
import schemaNormalizer from './normalizers/schema';
import readabilityNormalizer from './normalizers/readability';

var mapping = {
  opengraph: opengraphNormalizer,
  twitter: opengraphNormalizer,
  meta: metaNormalizer,
  microdata: schemaNormalizer,
  rdfa: schemaNormalizer,
  jsonld: schemaNormalizer,
  readability: readabilityNormalizer
};

var relatedProperties = {
  width: 'url',
  height: 'url',
  thumbnail_width: 'thumbnail_url',
  thumbnail_height: 'thumbnail_url'
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
      if (scoreThumbnail(cur) > scoreThumbnail(prev) && cur.thumbnail_url) {
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
  return oembed && oembed.url;
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
  if (oembed.thumbnail_score) {
    return oembed.thumbnail_score;
  }
  
  return !!oembed.width + !!oembed.height;
}

function finalizeOembed(oembed) {
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
