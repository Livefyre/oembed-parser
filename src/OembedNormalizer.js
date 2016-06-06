import {groupBy} from 'lodash';
import metaToOembed from './normalizers/meta';
import opengraphToOembed from './normalizers/opengraph';
import schemaToOembed from './normalizers/schema';

var mapping = {
  opengraph: opengraphToOembed,
  twitter: opengraphToOembed,
  meta: metaToOembed,
  microdata: schemaToOembed,
  rdfa: schemaToOembed,
  jsonld: schemaToOembed
};

var relatedProperties = {
  width: 'url',
  height: 'url',
  thumbnail_width: 'thumbnail_url',
  thumbnail_height: 'thumbnail_url'
};

export default function toOembed(data) {
  // Collect a list of oembeds for all of the metadata we collected
  var oembeds = [];
  for (var key in data) {
    let mapper = mapping[key];
    if (mapper && data[key]) {
      if (Array.isArray(data[key])) {
        oembeds.push(...data[key].map(mapper));
      } else {
        oembeds.push(mapper(data[key]));
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
    
      return prev;
    });
  }
  
  let res = types.video || types.image || types.link;
  
  console.log(res)
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
