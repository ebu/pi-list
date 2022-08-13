//convert.js
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const {
  transforms: { unwind },
  formatters: {
    default: defaultFormatter,
    number: numberFormatter,
    string: stringFormatter,
    stringQuoteOnlyIfNecessary: stringQuoteOnlyIfNecessaryFormatter,
    stringExcel: stringExcelFormatter,
    symbol: symbolFormatter,
    object: objectFormatter,
  },
} = require('json2csv');

unwind({ paths: ['streams'] });



const directoryPath = path.join(__dirname, 'jsonsToParse');

//passsing directoryPath and callback function
let convertFile = () => {
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      const fileExtension = path.extname(file);

      if (fileExtension !== ".json") return;
      const jsonPath = require(path.join(__dirname, './jsonsToParse/' + file));
      const pathToWrite = path.join(__dirname, './parsedCsv/jsonParsed.csv');

      const fields = [{ value: 'file_name', label: 'PCAP Name' },
      { value: 'total_streams', label: 'Total Streams' },
      { value: 'streams.full_media_type', label: 'Media Type' },
      { value: 'streams.full_transport_type', label: 'Transport Type' },
      { value: 'streams.statistics.dropped_packet_count', label: 'Dropped Packet Count' },
      { value: 'streams.network_information.destination_address', label: 'Destination IP Address' },
      { value: 'streams.network_information.destination_mac_address', label: 'Destination MAC Address' },
      { value: 'streams.media_specific.color_depth', label: 'Color Depth' },
      { value: 'streams.media_specific.colorimetry', label: 'Colorimetry' },
      { value: 'streams.media_specific.width', label: 'Width' },
      { value: 'streams.media_specific.height', label: 'Height' },
      { value: 'streams.media_specific.packets_per_frame', label: 'Packets per Frame' },
      { value: 'streams.statistics.frame_counte', label: 'Frame Count' },
      { value: 'streams.statistics.packet_count', label: 'Packet Count' },
      { value: 'streams.analyses.mac_address_analysis.result', label: 'Mac Address Analysis' },
      { value: 'streams.analyses.rtp_ts_vs_nt.result', label: 'RTP Offset' },
      { value: 'streams.analyses.packet_ts_vs_rtp_ts.result', label: 'Latency' },
      { value: 'streams.analyses.inter_frame_rtp_ts_delta.result', label: 'RTP time step' },
      { value: 'streams.analyses.tsdf.result', label: 'TS-DF' },
      { value: 'streams.analyses.2110_21_cinst.result', label: 'SMPTE 2110-21 (Cinst)' },
      { value: 'streams.analyses.2110_21_vrx.result', label: 'SMPTE 2110-21 (VRX)' },
      { value: 'streams.analyses.unique_multicast_destination_ip_address.result', label: 'Unique destination Multicast IP address' },
      { value: 'streams.analyses.destination_multicast_mac_address.result', label: 'Destination Multicast MAC address' },
      { value: 'streams.analyses.rtp_sequence.result', label: 'RTP Sequence' },
      { value: 'streams.analyses.field_bits.result', label: 'Field Bits' },
      { value: 'streams.analyses.marker_bit.result', label: 'Marker Bit' },
      { value: 'streams.analyses.anc_payloads.result', label: 'Ancillary Payloads' },
      { value: 'streams.analyses.pkts_per_frame.result', label: 'Packets per Frame' }];


      const functionNameFormatter = () => {
        return (value) => {
          if (value === 'compliant') return "Compliant";
          if (value === 'not_compliant') return "Not Compliant"
          return value;
        }
      }


      try {
        fs.readFile(file, function (err, data) {
          if (!fs.existsSync(pathToWrite)) {

            const json2csvParser = new Parser({
              fields,
              defaultValue: "Not applicable",
              transforms: [unwind({ paths: ['streams'] })],
              formatters: { string: functionNameFormatter() }
            });

            const csvFile = json2csvParser.parse(jsonPath);

            fs.writeFileSync(pathToWrite, csvFile, function (err) {
              if (err) throw err;
              console.log('File saved');
            })

          } else {
            const json2csvParser = new Parser({
              fields,
              header: false,
              transforms: [unwind({ paths: ['streams'] })],
              formatters: { string: functionNameFormatter() }
            });

            const csvFile = json2csvParser.parse(jsonPath);


            fs.appendFile(pathToWrite, "\n" + csvFile, function (err) {
              if (err) throw err;
              console.log('File saved');
            });
          }
        });

        const filePath = path.join(__dirname, './jsonsToParse/' + file)
        const pathToMoveFiles = path.join(__dirname, './parsedJsons/' + file)


        fs.rename(filePath, pathToMoveFiles, () => console.log('Files moved'));

      } catch (err) {
        console.error(err);
      }
    });
  })
}

convertFile();
