import {parseDimension} from '../utils';

export default function metaToOembed(meta, url) {
  // https://www.parsely.com/help/integration/metatags/
  // https://getstarted.sailthru.com/site/horizon-overview/horizon-meta-tags/
  // http://boomtrain.com/metadata-tags/
  var image = getImage(meta) || {};
  
  return {
    version: '1.0',
    type: 'link',
    url: meta.link.canonical || meta['parsely-link'] || url,
    title: meta.title,
    description: meta.description || meta['sailthru.description'],
    author_name: meta.author || meta['sailthru.author'] || meta['parsely-author'] || meta['bt:author'],
    author_url: meta.link.author || meta['article:author'],
    thumbnail_url: image.src,
    thumbnail_width: image.width,
    thumbnail_height: image.height,
    posted_at: meta['article:published_time'] || meta['article:published'] || meta['article:modified_time'] || meta['parsely-pub-date'] || meta['sailthru.date'] || meta.date || meta['dc.date.issued'] || meta['dc.date'] || meta['dc:date'] || meta['bt:pubDate'] || meta['bt:modDate']
  };
}

function getImage(meta) {
  var url = meta.link.image_src || meta.thumbnail || meta['parsely-image-url'] || meta['sailthru.image.full'];
  if (url) {
    return {
      src: url,
      width: parseDimension(meta.thumbnail_width),
      height: parseDimension(meta.thumbnail_height)
    };
  }
  
  return meta.images.map(img => {
    return {
      src: img.src,
      width: parseDimension(img.width),
      height: parseDimension(img.height)
    };
  }).sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
}