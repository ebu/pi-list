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
    { value: 'streams.network_information.destination_address', label: 'Destination IP Address' },
    { value: 'streams.network_information.destination_mac_address', label: 'Destination MAC Address' },
    { value: 'streams.media_specific.color_depth', label: 'Color Depth' },
    { value: 'streams.media_specific.colorimetry', label: 'Colorimetry' },
    { value: 'streams.media_specific.width', label: 'Width' },
    { value: 'streams.media_specific.height', label: 'Height' },
    { value: 'streams.media_specific.packets_per_frame', label: 'Packets per Frame' },
    { value: 'streams.statistics.dropped_packet_count', label: 'Dropped Packets' },
    { value: 'streams.statistics.frame_counte', label: 'Frame Count' },
    { value: 'streams.statistics.packet_count', label: 'Packet Count' },
    { value: 'streams.statistics.dropped_packet_count', label: 'Dropped Packets' },
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


    fs.readFile('jsonParsed.csv', function (err, data) {
      if (err) {
        const json2csvParser = new Parser({
          fields,
          transforms: [unwind({ paths: ['streams'] })],
          formatters: { string: functionNameFormatter() }
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
          transforms: [unwind({ paths: ['streams'] })],
          formatters: { string: functionNameFormatter() }

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
