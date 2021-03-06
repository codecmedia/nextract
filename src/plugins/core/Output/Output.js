/**
 * Mixes in methods used to export files
 *
 * @class Nextract.Plugins.Core.Output
 */

 /*
TODO:
2) Implement excel writer
*/

import _ from 'lodash';
import { isEmpty } from 'lodash/fp';
import JSONStream from 'JSONStream';
import fs from 'fs';
import csv from 'csv';
import pluginBase from '../../pluginBase';

//Instantiate the plugin
let outputPlugin = new pluginBase('Input', 'Core');

module.exports = {

  /**
   * Converts stream objects to csv strings (usually paired with toFile).
   *
   * @method toCsvString
   * @for Nextract.Plugins.Core.Output
   *
   * @example
   *     var formattingConfig = { headers: true, columns: { first_name: 'first_name', last_name: 'last_name', ... } };
   * @example
   *     transform.Plugins.Core.Output.toCsvString(formattingConfig);
   *
   * @param {Object} formattingConfig Object contain config options for the file type being written.
   * All options allowed by cvs-stringify (http://csv.adaltas.com/stringify/) are supported.
   *
   * @return {String} Returns a string formatted as a CSV
   */
  toCsvString: function(formattingConfig = {}) {
    let stringifier = csv.stringify(formattingConfig);

    return outputPlugin.getStreamPassthroughForPipe().pipe(stringifier);
  },

  /**
   * Converts stream objects to JSON strings (usually paired with toFile).
   *
   * @method toJsonString
   * @for Nextract.Plugins.Core.Output
   *
   * @example
   *     transform.Plugins.Core.Output.toJsonString(true);
   *
   * @param {Boolean} wrapJsonArray (defaults to true)
   * @param {String} open Custom opening string placed before JSON array. Defaults to '{\n\t"data": [\n\t'.
   * @param {String} close Custom close string placed after JSON array. Defaults to ',\n\t'.
   * @param {String} seperator Custom seperator places between array object elements. Defaults to '\n\t]\n}\n'.
   *
   * @return {String} Returns a string formatted as JSON
   */
  toJsonString: function(wrapJsonArray = true, open = '{\n\t"data": [\n\t', close = ',\n\t', seperator = '\n\t]\n}\n') {
    if (wrapJsonArray === true) {
      return outputPlugin.getStreamPassthroughForPipe().pipe(JSONStream.stringify(open, close, seperator));
    } else {
      return outputPlugin.getStreamPassthroughForPipe().pipe(JSONStream.stringify(false));
    }
  },

  /**
   * Writes stream to a file (usually preceeded by a call to toCsv, toExcel, toJSON, etc). Use the
   * stream finish event to know when the write is done. An end event is not not emitted.
   *
   * @method toFile
   * @for Nextract.Plugins.Core.Output
   *
   * @example
   *     var outputFilePath = '/path/to/file.extension';
   * @example
   *     transform.Plugins.Core.Output.toFile(outputFilePath);
   *
   * @param {Object} formattingConfig Object contain config options for the file type being written.
   * All options allowed by cvs-stringify (http://csv.adaltas.com/stringify/) are supported.
   */
  toFile: function(filePath) {
    const writeStream = fs.createWriteStream(filePath);

    //An end event is not triggered on fs.createWriteStream, but a finish event is. We want to force an
    //end event so that all transforms are consistent and have a chance to to cleanup with finish and end
    //events.
    writeStream.on('finish', function() {
      //Give the finish event a moment to be handled before firing end. Otherwise the transforms end event
      //will actually be called before the finish event.
      setTimeout(function() {
        writeStream.emit('end');
      }, 10);
    });

    return outputPlugin.getStreamPassthroughForPipe().pipe(writeStream);
  }

};
