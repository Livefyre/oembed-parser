import {parseDimension} from '../utils';

export default function metaToOembed(meta) {
  // https://www.parsely.com/help/integration/metatags/
  // https://getstarted.sailthru.com/site/horizon-overview/horizon-meta-tags/
  // http://boomtrain.com/metadata-tags/
  return {
    version: '1.0',
    type: 'link',
    url: meta.link.canonical || meta['parsely-link'],
    title: meta.title,
    description: meta.description || meta['sailthru.description'],
    author_name: meta.author || meta['sailthru.author'] || meta['parsely-author'] || meta['bt:author'],
    author_url: meta.link.author || meta['article:author'],
    thumbnail_url: meta.link.image_src || meta.thumbnail || meta['parsely-image-url'] || meta['sailthru.image.full'],
    thumbnail_width: parseDimension(meta.thumbnail_width),
    thumbnail_height: parseDimension(meta.thumbnail_height),
    posted_at: meta['article:published_time'] || meta['article:published'] || meta['article:modified_time'] || meta['parsely-pub-date'] || meta['sailthru.date'] || meta.date || meta['dc.date.issued'] || meta['dc.date'] || meta['dc:date'] || meta['bt:pubDate'] || meta['bt:modDate']
  };
}
