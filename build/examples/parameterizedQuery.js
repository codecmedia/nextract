'use strict';

/**
 * Example: Parameterized query
 */

var path = require('path'),
    Nextract = require(path.resolve(__dirname, '../nextract'));

var transform = new Nextract();

transform.loadPlugins('Core', ['Database', 'Logger']).then(function () {
  var sql = 'select first_name, last_name from employees where age >= :age';
  var sqlReplacements = { 'age': 30 };

  return transform.Plugins.Core.Database.selectQuery('nextract_sample', sql, sqlReplacements);
}).then(function (dbDataStream) {
  dbDataStream.on('data', function (resultingData) {
    //We aren't doing any additional transforms so no pipes are needed.
    //We'll just dump out the data when it arrives.
    if (resultingData !== undefined) {
      console.log(resultingData);
    }
  }).on('end', function () {
    transform.Plugins.Core.Logger.info('Transform finished!');
  });
}).catch(function (err) {
  transform.Plugins.Core.Logger.error('Transform failed:', err);
});