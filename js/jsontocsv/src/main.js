//convert.js
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const {
  transforms: { unwind },
} = require('json2csv');

unwind({ paths: ['streams'] });

const jsonPath = path.join(__dirname, './2vid_2aud.json');

const jsonFile = require(jsonPath);

const pathToWrite = path.join(__dirname, './jsonParsed.csv');

let convertFile = () => {
  try {
    const fields = [{ value: 'file_name', label: 'PCAP Name' },
    { value: 'total_streams', label: 'Total Streams' },
    { value: 'streams.full_media_type', label: 'Media Type' },
    { value: 'streams.full_transport_type', label: 'Transport Type' },
    { value: 'streams.statistics.dropped_packet_count', label: 'Dropped Packet Count' },
    { value: 'streams.analyses.mac_address_analysis.result', label: 'Mac Address Analysis' },
    { value: 'streams.media_specific.color_depth', label: 'Color Depth' },
    { value: 'streams.media_specific.colorimetry', label: 'Colorimetry' },
    { value: 'streams.media_specific.width', label: 'Width' },
    { value: 'streams.media_specific.height', label: 'Height' },
    { value: 'streams.media_specific.packets_per_frame', label: 'Packets per Frame' }];



    fs.readFile('jsonParsed.csv', function (err, data) {
      if (err) {
        const json2csvParser = new Parser({
          fields,
          transforms: [unwind({ paths: ['streams'] })]
        });

        const csvFile = json2csvParser.parse(jsonFile);

        fs.writeFile('jsonParsed.csv', csvFile, function (err) {
          if (err) throw err;
          console.log('File saved');
        });
      } else {
        const json2csvParser = new Parser({
          fields,
          header: false,
          transforms: [unwind({ paths: ['streams'] })]
        });

        const csvFile = json2csvParser.parse(jsonFile);

        fs.appendFile('jsonParsed.csv', "\r\n", function (err) {
          if (err) throw err;
          console.log('File saved');
        });

        fs.appendFile('jsonParsed.csv', csvFile, function (err) {
          if (err) throw err;
          console.log('File saved');
        });

      }
    });


  } catch (err) {
    console.error(err);
  }
}


convertFile();
