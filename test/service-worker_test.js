/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const temp = require('temp').track();
const vfs = require('vinyl-fs-fake');

const serviceWorker = require('../lib/service-worker');
const configFile = path.resolve(__dirname, 'precache-data', 'config.js');

// TODO BEFORE MERGE: Fix broken tests
suite.skip('service-worker', () => {

  suite('generation', () => {
    let buildRoot;
    setup((done) => {
      temp.mkdir('polymer-cli', (err, dir) => {
          if (err) {
            return done(err);
          }
          buildRoot = dir;
          vfs.src(path.join(__dirname, 'precache-data/static/*'))
          .pipe(vfs.dest(dir))
          .on('finish', () => done());
        }
      );
    });

    teardown((done) => {
      temp.cleanup(done)
    });

    test('without config', (done) => {
      serviceWorker.parsePreCacheConfig(path.join(__dirname, 'nope')).then(() => {
        serviceWorker.generateServiceWorker({
          root: path.resolve(__dirname, 'precache-data/static'),
          entrypoint: path.resolve(__dirname, 'precache-data/static/fizz.html'),
          buildRoot,
          deps: [],
          serviceWorkerPath: path.join(buildRoot, 'service-worker.js'),
        }).then(() => {
          let content =
            fs.readFileSync(path.join(buildRoot, 'service-worker.js'), 'utf-8');
          assert.include(content, '/fizz.html', 'entrypoint file should be present');
          done();
        });
      }).catch((err) => done(err));
    });

    test('with config', (done) => {
      serviceWorker.parsePreCacheConfig(configFile).then((config) => {
        return serviceWorker.generateServiceWorker({
          root: path.resolve(__dirname, 'precache-data/static'),
          entrypoint: path.resolve(__dirname, 'precache-data/static/fizz.html'),
          buildRoot,
          deps: [],
          swConfig: config,
          serviceWorkerPath: path.join(buildRoot, 'service-worker.js'),
        });
      }).then(() => {
        let content = fs.readFileSync(path.join(buildRoot, 'service-worker.js'), 'utf-8');
        assert.include(content, '/fizz.html', 'entrypoint file should be present');
        assert.include(content, '/foo.js', 'staticFileGlobs should match foo.js');
        done();
      });
    });
  })
});
