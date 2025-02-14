import {Parcel} from '@parcel/core';

let bundler = new Parcel({
  entries: 'a.js',
  defaultConfig: '@parcel/config-default'
});

try {
  let {bundleGraph, buildTime} = await bundler.run();
  let bundles = bundleGraph.getBundles();
  console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
} catch (err) {
  console.log(err.diagnostics);
}