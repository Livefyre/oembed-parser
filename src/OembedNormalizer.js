export default function toOembed(data) {
  let ogType = r.opengraph.type;
  let type = 'link';
  if (ogType) {
    if (/video/.test(ogType))
      type = 'video';
    else if (/image|photo/.test(ogType))
      type = 'image';
  }
  
  let result = {
    type: type,
    version: '1.0',
    url: data.opengraph.url || data.meta.canonical,
    title: data.opengraph.title || data.twitter.title || data.title,
    description: data.opengraph.description || data.twitter.description || data.meta.description,
    author_name: data.meta.author,
    author_url: data.meta.link.author
  };
  
  let image = {
    src: data.opengraph.image.url || data.twitter.image.url || data.meta.link.image_src,
    width: parseInt(data.opengraph.image.width || data.twitter.image.width, 10) || undefined,
    height: parseInt(data.opengraph.image.height || data.twitter.image.height, 10) || undefined
  };
  
  if (type === 'image') {
    Object.assign(result, image);
  } else {
    result.thumbnail_url = image.src;
    result.thumbnail_width = image.width;
    result.thumbnail_height = image.height;
  }
  
  if (type === 'video') {
    Object.assign(result, {
      src: data.opengraph.video || data.twitter.player.stream.url || data.twitter.player.url
    });
  }
  
  return result;
}

function schemaToOembed(schema) {
  let type = (schema['@type'] || '').replace('http://schema.org/', '');
  let image = getImage(schema.image) || getImage(schema.primaryImageOfPage) || getImage(schema.thumbnail) || getImage(schema.thumbnailUrl) || {};
  let thumbnail = getImage(schema.thumbnail) || {};
  let author = getAuthor(schema.author || schema.creator || schema.producer || schema.contributor) || {};
  
  switch (type) {
    case 'Article':
    case 'NewsArticle':
    case 'BlogPosting':
    case 'WebPage':
      return {
        version: '1.0',
        type: 'link',
        url: schema.url,
        title: schema.headline || schema.alternativeHeadline,
        description: schema.description,
        thumbnail_url: image.contentUrl,
        thumbnail_width: parseInt(image.width, 10) || undefined,
        thumbnail_height: parseInt(image.width, 10) || undefined,
        author_name: author.name,
        author_url: author.url,
        posted_at: schema.datePublished || schema.dateCreated || schema.dateModified
      };
      
    case 'ImageObject':
      return {
        version: '1.0',
        type: 'image',
        url: schema.contentUrl,
        link: schema.url,
        width: parseInt(schema.width, 10) || undefined,
        height: parseInt(schema.width, 10) || undefined,
        thumbnail_url: thumbnail.contentUrl,
        thumbnail_width: parseInt(thumbnail.width, 10) || undefined,
        thumbnail_height: parseInt(thumbnail.width, 10) || undefined,
        title: schema.caption,
        description: schema.description,
        posted_at: schema.datePublished || schema.dateCreated || schema.dateModified
      };
      
    case 'VideoObject':
      return {
        version: '1.0',
        url: schema.contentUrl || schema.embedUrl,
        link: schema.url,
        width: parseInt(schema.width, 10) || undefined,
        height: parseInt(schema.width, 10) || undefined,
        thumbnail_url: thumbnail.contentUrl,
        thumbnail_width: parseInt(thumbnail.width, 10) || undefined,
        thumbnail_height: parseInt(thumbnail.width, 10) || undefined,
        title: schema.caption,
        description: schema.description,
        posted_at: schema.datePublished || schema.dateCreated || schema.dateModified
      };
  }
}

function getImage(image) {
  if (typeof image === 'string') {
    return {
      contentUrl: image
    };
  }
  
  return image;
}

function getAuthor(author) {
  if (typeof author === 'string') {
    return {
      name: author
    };
  }
  
  if (typeof author === 'object') {
    if (!author.name && (author.givenName || author.familyName)) {
      author.name = [author.givenName, author.familyName].filter(Boolean).join(' ');
    }
    
    return author;
  }
}
