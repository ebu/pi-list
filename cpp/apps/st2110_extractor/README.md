# ST2110-20 Analyzer

Extracts all the information from the streams contained in a .pcap file.

The information is written to a directory (given as an argument) with the following structure:

```
/<file_id>/_meta.json - information about the pcap file
/<file_id>/<stream_id> - folder, whose name is an unique id assigned to the stream
/<file_id>/<stream_id>/_meta.json - information about the stream
/<file_id>/<stream_id>/frames/<n>/_meta.json - information about frame n
/<file_id>/<stream_id>/frames/<n>/packets/<m>/_meta.json - information about packet <m> of frame n
```

## How to launch

`st2110_extractor  <pcap file> <base dir> [<influxDB url>] -s [<stream id>]`

where

- **pcap file**: the path to the pcap file to use as input
- **base dir**: the path to the base directory where to write the information
- **influxDB url**: url to influxDB. Usually http://localhost:8086
- **stream id**: One or more stream ids to process. If none is specified, processes all streams in the file.

