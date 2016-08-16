# htmlmeta

Streaming HTML metadata parser, and [oembed](http://oembed.com) converter.

Supports the following types of metadata:

* Open Graph
* Twitter Cards
* Microdata
* RDFa
* JSON+LD
* Meta tags
* Readability

## Example

```javascript
import Parser from 'htmlmeta';
import request from 'request';

const url = 'http://nyti.ms/2blhZjw';

request(url)
  .pipe(new Parser(url))
  .on('finish', function () {
    let data = this.getData();
    let oembed = this.getOembed();
  });
```

The raw data returned by `parser.getData()` is an object that looks like this:

```javascript
{
  "opengraph": {...},
  "twitter": {...},
  "microdata": {...},
  "meta": {...},
  "jsonld": {...},
  "rdfa": {...},
  "readability": {...}
}
```

The oembed returned by `parser.getOembed()` for the above link looks like this:

```json
{
  "version": "1.0",
  "type": "link",
  "url": "http://www.nytimes.com/2016/08/17/nyregion/great-white-shark-new-york.html",
  "title": "Searching for a Great White Shark, in the Waters Off Long Island",
  "description": "A team of scientists and researchers is hoping to prove that a swath of the New York coast serves as a great white breeding ground.",
  "thumbnail_url": "https://static01.nyt.com/images/2016/08/16/nyregion/0816SHARKSss-slide-BK4M/0816SHARKSss-slide-BK4M-facebookJumbo.jpg",
  "author_name": "Samantha Schmidt",
  "posted_at": "2016-08-16T18:47:45.000Z",
  "provider_url": "http://nytimes.com",
  "provider_name": "nytimes"
}
```

## How it works

The parser itself is fairly simple. Stream data is piped through [htmlparser2](https://github.com/fb55/htmlparser2),
and tag handlers for each format (listed above) are run, producing the raw metadata returned by `parser.getData()`.

The oembed converter takes the metadata returned by the parser, and for each format produces an oembed.
The list of embeds is then validated, grouped by url, scored, and reduced to the single oembed returned
by `parser.getOembed()`.

## License

MIT
