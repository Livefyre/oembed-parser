export default function readabilityToOembed(readability, url) {
  return {
    version: '1.0',
    type: 'link',
    url: url,
    title: readability.title,
    description: readability.text.split('\n')[0]
  };
}
