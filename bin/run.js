#!/usr/bin/env node
/* eslint-disable no-undef */

require('@oclif/core')
  .run(process.argv.slice(2), __dirname)
  .then(require('@oclif/core/flush'))
  .catch(require('@oclif/core/handle'));
