import {parseDimension, get} from '../utils';
const URL = require('url');

export default function opengraphToOembed(og, url) {
  let type = 'link';
  if ((/image|photo/.test(og.type) && !/profile/.test(og.type) && og.image)) {
    type = 'photo';
  }
  
  let article = get(og.article) || {};
  let result = {
    version: '1.0',
    type: type,
    url: og.url || url,
    link: og.url || url,
    title: og.title,
    description: og.description,
    provider_name: og.site_name || og.domain || (og.site && (og.site.name || '').replace(/^@/, '')),
    posted_at: og.pubdate || article.published_time || article.modified_time,
    author_name: article.author
  };
  
  let ogImage = get(og.image) || {};
  let image = {
    url: ogImage.url || ogImage.src,
    width: parseDimension(ogImage.width),
    height: parseDimension(ogImage.height)
  };
  
  if (type === 'photo') {
    Object.assign(result, image);
  } else {
    result.thumbnail_url = image.url;
    result.thumbnail_width = image.width;
    result.thumbnail_height = image.height;
  }
  
  let video = get(og.video || og.player);
  let videoURL = video && ((video.stream && video.stream.url) || video.url);
  if (videoURL && videoURL !== url) {
    const parsedURL = URL.parse(videoURL, true);
    if (parsedURL.host == 'vk.com') {
      var oid = parsedURL.query.oid;
      var id = parsedURL.query.vid;
      var hash = parsedURL.query.embed_hash;
      var fixedURL = "https://vk.com/video_ext.php?oid=" + oid + "&id=" + id + "&hash=" + hash;
    }
    let video_type = video.stream && video.stream.url ? 'video' : 'iframe';
    Object.assign(result, {
      type: /music|song/.test(og.type) ? 'rich' : 'video',
      url: fixedURL,
      width: parseDimension(video.width),
      height: parseDimension(video.height),
      video_type: video_type,
      score: video_type === 'video' ? 2 : 0
    });
  }
  
  return result;
}
