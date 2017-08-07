import Parser from '../src/Parser';
import fs from 'fs';
import assert from 'assert';

describe('oembed-parser', function() {
  let dir = __dirname + '/data/input/';
  for (let file of fs.readdirSync(dir)) {
    it(file, function(done) {
      let match = fs.readFileSync(dir + file, 'utf8').match(/^<!--\s*(.+?)\s*-->/);
      let url = match && match[1];

      let parser = new Parser(url);
      fs.createReadStream(dir + file)
        .pipe(parser)
        .once('finish', function() {
          let expected = require('./data/output/' + file.replace('.html', '.json'));
          let output = JSON.parse(JSON.stringify(parser.getOembed()));
          assert.deepEqual(output, expected);
          done();
        });
    });
  }
});
