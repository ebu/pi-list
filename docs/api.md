# LIST API
Behind its graphical user interface, _LIST_ has a HTTP server that exposes an
_API_ capable of turning it into a valuable validation tool in a LiveIP pipeline.
Operations such as uploading _pcap_ files, tracking of the analysis progress and
getting the results are all available, among others. This document describes the
aforementioned _API_.

## Preamble
- Request and response bodies, when available, are formated in
  [_JSON_](https://www.json.org/json-en.html).
- In `POST/PUT` requests, the `Content-Type` header must be present and is usually
  expected to have the value `application/json;charset=UTF-8`, otherwise it is
  specified in this document.
- Except for the [Authentication routes](#authentication), all API routes
  require the presence of the `Authorization` header with the format
  `"Bearer <bearer-token>"`.  The `<bearer-token>` is a string of characters
  that can be obtained by a successful request to the [`login`](#login) route.
- For any resource (pcap, stream, report, user...) that can't be found a
  `HTTP/404` is received with the following answer:
  ```json
  {
    "code":"RESOURCE_NOT_FOUND",
    "message":"The resource that you tried to access does not exist."
  }
  ```

## Routes
- [Analysis](#analysis)
  * [`Upload pcap file`](#upload-pcap-file)
  * [`Get all analysis`](#get-all-analysis)
  * [`Get one analysis`](#get-one-analysis)
  * [`Delete one analysis`](#delete-one-analysis)
  * [`Re-analyze`](#re-analyze)
  * [`Download json report`](#download-json-report)
  * [`Download pdf report`](#download-pdf-report)
  * [`Download bundle of genererated SDP`](#download-bundle-of-generated-sdp)
  * [`Download pcap file`](#download-pcap-file)
  * [`Download original capture file`](#download-original-capture-file)
  * [`Get PTP Offset`](#get-ptp-offset)
- [Analysis Profile](#analysis-profile)
- [Authentication](#authentication)
  * [`register`](#register)
  * [`login`](#login)
  * [`logout`](#logout)
- [Comparisons](#comparisons)
  * [`Get all comparisons`](#get-all-comparisons)
  * [`Get one comparison`](#get-one-comparison)
  * [`Delete one comparison`](#delete-one-comparison)
  * [`Update one comparison`](#update-one-comparison)
- [Download Manager](#download-manager)
  * [`List all`](#list-all)
  * [`Download item`](#download-item)
- [Meta Information](#meta-information)
- [SDP](#sdp)
  * [`Available Options`](#)
  * [`Ingest SDP`](#)
  * [`Convert SDP file to a sender`](#)
- [Streams](#streams)
  * [`Get all streams`](#get-all-streams)
  * [`Get one stream`](#get-one-stream)
  * [`Rename`](#rename)
  * [`Get help`](#get-help)
  * [`Re-analyze`](#re-analyze)
  * [`Get histogram`](#get-histogram)
  * [`Get timestamped measurement`](#get-timestamped-measurement)
  * [`Get metadata of all frames`](#get-metadata-of-all-frames)
  * [`Get all packet metadata for a frame`](#get-packet-of-all-frames)
  * [`Get a PNG frame`](#get-a-png-frames)
  * [`Get a JPG thumbnail`](#get-a-jpg-thumbnail)
  * [`Render mp3`](#render-mp3)
  * [`Get rendered mp3`](#get-rendered-mp3)
  * [`Get ancillary decoded payload`](#get-ancillary-decoded-payload)
- [User](#user)
- [Workflow](#workflow)

---

## Models
- [Analysis Model](#analysis-model)
- [Analysis Profile](#analysis-profile)
- [Stream Model](#stream-model)
  * [`Video`](#video-stream)
  * [`Audio`](#audio-stream)
  * [`Ancillary`](#ancillary-stream)
- [Timestamped measurement](#timestamped-measurement)
- [Frame metadata](#frame-metadata)
- [Video packet metadata](#video-packet-metadata)

---

## Routes

### Analysis

#### Upload pcap file
- Path: `/api/pcap`
- Method: `PUT`
- Content-Type: `multipart/form-data; boundary=---------------------------<asciiDelimitorString>`
- Request Body:
    ```
    -----------------------------<asciiDelimitorString>
    Content-Disposition: form-data; name="pcap"; filename="<pcapFilename>"
    Content-Type: application/vnd.tcpdump.pcap
    <rawRata>
    -----------------------------<asciiDelimitorString>--
    ```
- Response:
  * HTTP/201:
    ```json
      {
        "uuid":"<pcapId>",
        "folder":"<dataPath>/<userId>/<pacpId>"
      }
    ```
  * HTTP/401:
    ```json
      {
        "sucess": false
      }
    ```
#### Get all analysis
- Path: `/api/pcap`
- Method: `GET`
- Response:
  * HTTP/200: `[ <listOfAnalysis> ]` ([analysis model](#analysis-model))

#### Get one analysis
- Path: `/api/pcap/<pcapId>`
- Method: `GET`
- Response:
  * HTTP/200: `<Analysis>` ( [analysis model](#analysis-model) )
  * HTTP/404:

#### Delete one analysis
- Path: `/api/pcap/<pcapId>`
- Method: `DELETE`
- Response:
  * HTTP/200: ` `

#### Re-analyze
- Path: `/api/pcap/<pcapId>`
- Method: `PATCH`
- Response:
  * HTTP/502: `Gateway time`

#### Download json report
- Path: `/api/pcap/<pcapId>/report?type=json`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-disposition: `attachment; filename=<reportJsonFile>`
    + Body:  `<Analysis>` ( [model](#analysis-model) )

#### Download PDF report
- Path: `/api/pcap/<pcapId>/report?type=json`
- Method: `GET`

#### Download bundle of genererated SDP
- Path: `/api/pcap/<pcapId>/sdp`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-disposition: `attachment; filename=<SDPZipArchive>`
    + Content-Type: `application/zip`
    + Body:  `<rawData>`

#### Download pcap file
- Path: `/api/pcap/<pcapId>/original`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-disposition: `attachment; filename=<pcapFileName>`
    + Content-Type: `application/vnd.tcpdump.pcap`
    + Body:  `<rawData>`

#### Download original capture file
- Path: `/api/pcap/<pcapId>/download_original`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-disposition: `attachment; filename=<pcapFileName>`
    + Content-Type: `application/vnd.tcpdump.pcap`
    + Body:  `<rawData>`

#### Get PTP Offset
- Path: `/api/pcap/<pcapId>/analytics/PtpOffset`
- Method: `GET`
- Response:
  * HTTP/200: `[ <rawMeasurements> ]`

### Authentication

#### Register
- Path: `/user/register`
- Method: `POST`
- Request Body: `{ "username": "<usr>", "password": "<pwd>" }`
- Response:
  * HTTP/201:
    ```json
    {
      "id": "",
      "username": "",
      "password": "<pwd>",
      "salt": "",
      "preferences": {
        "analysys": {
          "currentprofileid": null
        },
        "gui": {
          "_id": "<id>",
          "language": "en-us",
          "theme": "dark"
        }
      },
      "_id": "<id>"
    }
    ```
  * http/500:
    ```
    e11000 duplicate key error collection: list.users index: username_1 dup key: { username: "<usr>" }
    user validation failed: username: path `username` is required.
    ```

#### Login
- Path: `/auth/login`
- Method: `POST`
- Request Body: `{ "username": "<usr>", "password": "<pwd>" }`
- Response:
  * HTTP/200:
    ```json
    {
      "result": 0,
      "desc": "Authentication successful",
      "content": {
        "sucess": true,
        "token": "<bearer-token>"
      }
    }
    ```
  * HTTP/401:
    ```json
    {
      "result": 401,
      "desc": "Authentication failed",
      "content": {
        "sucess": false,
        "token": null
      }
    }
    ```

#### Logout
- Path: `/auth/logout`
- Method: `POST`
- Request Body: `{}`
- Response:
  * HTTP/200:
    ```json
    {
      "success": true,
      "message": "Logout successful!"
    }
    ```

### Analysis Profile

### Comparisons

#### Get all comparisons
- Path: `/api/comparisons`
- Method: `GET`
- Response:
  * HTTP/200: `[ <listOfComparisons> ]` ([comparison model](#comparison-model))

#### Get one comparison
- Path: `/api/comparisons/<comparisonId>`
- Method: `GET`
- Response:
  * HTTP/200: `<Analysis>` ( [comparison model](#comparison-model) )

#### Delete one comparison
- Path: `/api/comparisons/<comparisonId>`
- Method: `DELETE`
- Response:
  * HTTP/200: `<Analysis>` ( [comparison model](#comparison-model) )

#### Update one comparison
- Path: `/api/comparisons/<comparisonId>`
- Method: `POST`
- Response:
  * HTTP/200: `<Analysis>` ( [comparison model](#comparison-model) )

### Download Manager
#### List all
- Path: `/api/downloadmngr/`
- Method: `GET`
- Response:
  * HTTP/200:
    ```
    { [{
      "name": "<designation>",
      "nameondisk": "<filename>",
      "path": "<fspath>",
      "type": "<orig|pcap|json|pdf|zip>",
      "availableon": "<creation-date>",
      "availableonfancy": "<creation-date-pretty>",
      "availableuntil": "<expiry-date>",
      "availableuntilfancy": "<expiry-date-pretty>"
    }, ...]}
    ```

#### Download item
- Path: `/api/downloadmngr/<id>`
- Method: `GET`
- Response:
  * HTTP/200: `<file>`

#### Get all streams

### Meta Information

### Streams

#### Get all streams
- Path: `/api/pcap/<pcapId>/streams`
- Method: `GET`
- Response:
  * HTTP/200: `[<listOfStreams>]` ([stream model](#stream-model))

#### Get one stream
- Path: `/api/pcap/<pcapId>/stream/<streamId>`
- Method: `GET`
- Response:
  * HTTP/200: `<stream>` ([stream model](#stream-model))

#### Rename
- Path: `/api/pcap/<pcapId>/stream/<streamId>`
- Method: `PATCH`
- Response:
  * HTTP/200: `<stream>` ([stream model](#stream-model))

#### Get help
- Path: `/api/pcap/<pcapId>/stream/<streamId>/help`
- Method: `GET`
- Response:
  * HTTP/200: `<stream>` ([stream model](#stream-model))

#### Re-analyze
- Path: `/api/pcap/<pcapId>/stream/<streamId>/help`
- Method: `PUT`
- Request Body: `<stream>`
- Response:
  * HTTP/200: `<stream>` ([stream model](#stream-model))

#### Get histogram
- Path: `/api/pcap/<pcapId>/stream/<streamId>/analytics/<measurement>/histogram`
- Possible values for <measurement>:
  * `CIsnt`
  * `Vrx`
- Method: `GET`
- Response:
  * HTTP/200: `{"histogram":[[0,103845],[1,13131],[...]]}`

#### Get AncillaryPktHistogram
- Path: `/api/pcap/<pcapId>/stream/<streamId>/analytics/AncillaryPktHistogram`
- Method: `GET`
- Response:
  * HTTP/200: `{"histogram":[[0,103845],[1,13131],[...]]}`

#### Get timestamped measurement
- Path: `/api/pcap/<pcapId>/stream/<streamId>/analytics/<measurement>?from=<startTimeInNs>&to=<endTimeInNs>`
- Possible values for <measurement>:
  * `AudioPktTsVsRtpTs`
  * `AudioTimeStampedDelayFactor`
  * `CInst`
  * `CInstRaw`
  * `VrxIdeal`
  * `VrxIdealRaw`
  * `DeltaToIdealTpr0Raw`
  * `DeltaRtpTsVsPacketTsRaw`
  * `DeltaPacketTimeVsRtpTimeRaw`
  * `DeltaToPreviousRtpTsRaw`
  * `DeltaToPreviousRtpTsMinMax`
  * `DeltaRtpVsNt`
  * `DeltaRtpVsNtTicksMinMax`
  * `packetsPerFrame`
- Method: `GET`
- Response:
  * HTTP/200: `[ <listOfTimestampedMeasurements> ]` ([Timestamped measurement model](#timestamped-measurement))

##### Get metadata of all frames
- Path: `/api/pcap/<pcapId>/stream/<streamId>/frames`
- Method: `GET`
- Response:
  * HTTP/200: `[<listOfFrameMetadata>]` ([frame metadata model](#frame-metadata))

##### Get all packet metadata for a frame
- Path: `/api/pcap/<pcapId>/stream/<streamId>/frame/<frameId>`
- Method: `GET`
- Response:
  * HTTP/200: `[<listOfPacketMetadata>]` ([video packet metadata model](#video-packet-metadata))

##### Get a PNG frame
- Path: `/api/pcap/<pcapId>/stream/<streamId>/frame/<frameId>/png?token=Bearer+<token>`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-Type: `image/png`
    + Body: `<rawData>`

##### Get a JPG thumbnail
- Path: `/api/pcap/<pcapId>/stream/<streamId>/frame/<frameId>/jpg?token=Bearer+<token>`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-Type: `image/jpg`
    + Body: `<rawData>`

##### Render mp3
- Path: `/api/pcap/<pcapId>/stream/<streamId>/rendermp3?channel=<commaSeparatedChannelList>`
- Method: `GET`
- Response:
  * HTTP/200

##### Get rendered mp3
- Path:
  `/api/pcap/<pcapId>/stream/<streamId>/downloadmp3?channel=<commaSeparatedChannelList>&token=Bearer+<token>`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-Type: `audio/mpeg`
    + Body: `<rawData>`

##### Get ancillary decoded payload
- Path: `/api/pcap/<pcapId>/stream/<streamId>/ancillary/<decodedFileName>`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-Type: `application/octet-stream`
    + Body: `<rawData>`

### SDP

#### Available Options
- Path: `/api/sdp/available-options[?media_type=<video|audio|ancillary>]`
- Method: `GET`
- Response:
  * HTTP/200:
    + Content-Type: `application/octet-stream`
    + Body:
      - W/out query string: ` [{"label": "<name>", "value": "<value>"}...]`
      - W/ query string: `[ { "key": "", "value": [{ "label": "<name>", "value": "<value>" }...] }...]`

#### Ingest SDP
- Path: `/api/sdp/`
- Method: `PUT`
- Response: HTTP/201 (empty body)

#### Convert to Sender
- Path: `/api/sdp/to_source`
- Method: `PUT`
- Response:
  * HTTP/201:
    - Content-Type: `Content-Type: application/json; charset=utf-8`
    ```
    {
      "result": "success",
      "source": {
        "id": "<uuid>",
        "kind": "from_sdp",
        "meta": {
          "format": "",
          "label": ""
        }
        "sdp": {
          "errors": ["<error-description>",...],
          "raw": "<sdp>"
          "streams": [{ "dstAddr": "<dst-ip-addr>", "dstPort": <dest-port>, "srcAddr": "<src-ip-addr>" }...]
        }
      }
    ```

### User

TODO
/api/user/revalidate-token
GET
  * HTTP/200:
    ```json
    {
      "result": 0,
      "desc": "Revalidated successfully",
      "content": {
        "success": true,
        "token": "<bearer-token>"
      }
    }
    ```

###  Workflow

## [Models](#models)

### Analysis Model

```json
{
  "_id": "<mongoUId>",
  "analysis_profile": <analysisProfile>,
  "analyzed": true,
  "analyzer_version": "1.16.5",
  "anc_streams": 1,
  "audio_streams": 0,
  "capture_date": <fileDate>,
  "capture_file_name": "<storageCatureFilename>",
  "date": <analysiDateInSeconds>,
  "error": "",
  "file_name": "<originalCaptureFilename>",
  "generated_from_network": false,
  "id": "<pcapId>",
  "narrow_linear_streams": 0,
  "narrow_streams": 0,
  "not_compliant_streams": 0,
  "offset_from_ptp_clock": 0,
  "owner_id": <userId>,
  "pcap_file_name": "<storagePcapFilename>",
  "summary":
  {
    "error_list": [
    {
      "stream_id": "<streamId>",
      "value": {
        "id": "<errorString>"
      }
    }
    ],
    "warning_list": []
  },
  "total_streams": 1,
  "truncated": false
}
```

### Analysis Profile
```json
{
  "id": "<id>",
    "label": "JT-NM Tested",
    "timestamps":
    {
      "source": "pcap"
    }
}
```

### Stream Models

#### Video stream
```json
{
  "_id": "<mongoUId>",
    "analyses": {
      "2110_21_cinst": {
        "result": "compliant"
      },
      "2110_21_vrx": {
        "result": "compliant"
      },
      "destination_multicast_ip_address": {
        "result": "compliant"
      },
      "destination_multicast_mac_address": {
        "result": "compliant"
      },
      "inter_frame_rtp_ts_delta": {
        "details": {
          "limit": {
            "max": 1502,
            "min": 1501
          },
          "range": {
            "avg": 1501.4905660377358,
            "max": 1502,
            "min": 1501
          },
          "unit": "ticks"
        },
        "result": "compliant"
      },
      "packet_ts_vs_rtp_ts": {
        "details": {
          "limit": {
            "max": 1000000,
            "min": 0
          },
          "range": {
            "avg": 613084.6851851852,
            "max": 620842,
            "min": 605106
          },
          "unit": "ns"
        },
        "result": "compliant"
      },
      "rtp_sequence": {
        "details": {
          "dropped_packets_count": 0,
          "dropped_packets_samples": [],
          "packet_count": 116976
        },
        "result": "compliant"
      },
      "rtp_ts_vs_nt": {
        "details": {
          "limit": {
            "max": 60,
            "min": -1
          },
          "range": {
            "avg": 0,
            "max": 0,
            "min": 0
          },
          "unit": "ticks"
        },
        "result": "compliant"
      },
      "unique_multicast_destination_ip_address": {
        "result": "compliant"
      },
      "unrelated_multicast_addresses": {
        "result": "compliant"
      }
    },
    "error_list": [],
    "global_video_analysis": {
      "cinst": {
        "cmax_narrow": 4,
        "cmax_wide": 16,
        "compliance": "narrow",
        "histogram": [
          [
            0,
        88.77462005615234
          ],
          [
            1,
          11.225379943847656
          ]
        ]
      },
      "compliance": "narrow",
      "trs": {
        "trs_ns": 7414.814814814815
      },
      "vrx": {
        "compliance": "narrow",
        "histogram": [
          [
            4,
        0.0929008275270462
          ],
          [
            5,
          50.07354736328125
          ],
          [
            6,
          0.1393512487411499
          ],
          [
            7,
          49.6942024230957
          ]
        ],
        "vrx_full_narrow": 8,
        "vrx_full_wide": 720
      }
    },
    "id": "<pcapId>",
    "media_specific": {
      "avg_tro_ns": 613242,
      "color_depth": 10,
      "colorimetry": "BT709",
      "has_continuation_bit_set": false,
      "height": 1080,
      "max_tro_ns": 620888,
      "min_tro_ns": 605629,
      "packets_per_frame": 2160,
      "packing_mode": 1,
      "rate": "60000/1001",
      "sampling": "YCbCr-4:2:2",
      "scan_type": "interlaced",
      "schedule": "gapped",
      "tro_default_ns": 652504,
      "width": 1920
    },
    "media_type": "video",
    "network_information": {
      "destination_address": "225.192.10.1",
      "destination_mac_address": "01:00:5e:40:0a:01",
      "destination_port": "20000",
      "dscp": {
        "consistent": true,
        "value": 0
      },
      "has_extended_header": false,
      "inter_packet_spacing": {
        "after_m_bit": {
          "avg": 677469,
          "max": 692485,
          "min": 662417
        },
        "regular": {
          "avg": 5603,
          "max": 12352,
          "min": 4122
        }
      },
      "multicast_address_match": true,
      "payload_type": 96,
      "source_address": "192.168.105.1",
      "source_mac_address": "98:5d:82:97:3f:a3",
      "source_port": "10000",
      "ssrc": 0,
      "valid_multicast_ip_address": true,
      "valid_multicast_mac_address": true
    },
    "pcap": "916e7e46-c9b8-418f-bb87-2ba2a6925135",
    "state": "analyzed",
    "statistics": {
      "dropped_packet_count": 0,
      "dropped_packet_samples": [],
      "first_frame_ts": 856317980,
      "first_packet_ts": "1597785070626326897",
      "frame_count": 55,
      "is_interlaced": true,
      "last_frame_ts": 856399061,
      "last_packet_ts": "1597785071529711557",
      "max_line_number": 539,
      "packet_count": 116976,
      "rate": 59.94005994005994
    }
}
```

#### Audio stream

```json
{
  "_id": "5f8efc85c53b0000601e7574",
    "analyses": {
      "destination_multicast_ip_address": {
        "result": "compliant"
      },
      "destination_multicast_mac_address": {
        "result": "compliant"
      },
      "packet_ts_vs_rtp_ts": {
        "details": {
          "limit": {
            "max": 1000,
            "min": 0
          },
          "range": {
            "max": -3727263604,
            "min": -3727263875,
            "time": "1970-01-01T00:00:00Z"
          },
          "unit": "\u03bcs"
        },
        "result": "not_compliant"
      },
      "rtp_sequence": {
        "details": {
          "dropped_packets_count": 0,
          "dropped_packets_samples": [],
          "packet_count": 10062
        },
        "result": "compliant"
      },
      "tsdf": {
        "details": {
          "compliance": "narrow",
          "level": "narrow",
          "limit": 17000,
          "max": 63,
          "result": "compliant",
          "tolerance": 1000,
          "unit": "\u03bcs"
        },
        "result": "compliant"
      },
      "unique_multicast_destination_ip_address": {
        "result": "compliant"
      },
      "unrelated_multicast_addresses": {
        "result": "compliant"
      }
    },
    "error_list": [
    {
      "id": "errors.audio_rtp_ts_not_compliant"
    }
    ],
    "global_audio_analysis": {
      "packet_ts_vs_rtp_ts": {
        "limit": {
          "max": 1000,
          "min": 0
        },
        "range": {
          "max": -3727263604,
          "min": -3727263875,
          "time": "1970-01-01T00:00:00Z"
        },
        "unit": "\u03bcs"
      },
      "tsdf": {
        "compliance": "narrow",
        "level": "narrow",
        "limit": 17000,
        "max": 63,
        "result": "compliant",
        "tolerance": 1000,
        "unit": "\u03bcs"
      }
    },
    "id": "81a932c7-1f1f-48c2-999b-0c275615f95a",
    "media_specific": {
      "encoding": "L16",
      "number_channels": 2,
      "packet_time": "1.000000",
      "sampling": "48000"
    },
    "media_type": "audio",
    "network_information": {
      "destination_address": "239.31.114.5",
      "destination_mac_address": "01:00:5e:1f:72:05",
      "destination_port": "5004",
      "dscp": {
        "consistent": true,
        "value": 34
      },
      "has_extended_header": false,
      "inter_packet_spacing": {
        "after_m_bit": {
          "avg": 0,
          "max": 0,
          "min": 0
        },
        "regular": {
          "avg": 997584,
          "max": 1032477,
          "min": 970657
        }
      },
      "multicast_address_match": true,
      "payload_type": 98,
      "source_address": "192.168.61.114",
      "source_mac_address": "00:0b:2f:01:62:da",
      "source_port": "5004",
      "ssrc": 8142194,
      "valid_multicast_ip_address": true,
      "valid_multicast_mac_address": true
    },
    "pcap": "b181a630-ccf1-11ea-ae42-3f634fa50811",
    "state": "analyzed",
    "statistics": {
      "dropped_packet_count": 0,
      "dropped_packet_samples": [],
      "first_packet_ts": "1518711391405368516",
      "last_packet_ts": "1518711401466152425",
      "packet_count": 10062,
      "packet_size": 192,
      "sample_count": 482976,
      "samples_per_packet": 48
    }
}
```

#### Ancillary stream

```json
{
  "_id": "5f8dfdb684e18103df0b77f6",
    "analyses": {
      "anc_payloads": {
        "result": "compliant"
      },
      "destination_multicast_ip_address": {
        "result": "compliant"
      },
      "destination_multicast_mac_address": {
        "result": "compliant"
      },
      "field_bits": {
        "result": "compliant"
      },
      "inter_frame_rtp_ts_delta": {
        "details": {
          "limit": {
            "max": 1502,
            "min": 1501
          },
          "range": {
            "avg": 1501.5,
            "max": 1502,
            "min": 1501
          },
          "unit": "ticks"
        },
        "result": "compliant"
      },
      "marker_bit": {
        "result": "compliant"
      },
      "packet_ts_vs_rtp_ts": {
        "details": {
          "limit": {
            "max": 1000000,
            "min": 0
          },
          "range": {
            "avg": 12529846824324.877,
            "max": 12529846832514,
            "min": 12529846816778
          },
          "unit": "ns"
        },
        "result": "not_compliant"
      },
      "pkts_per_frame": {
        "details": {
          "histogram": [
            [
              1,
          1
            ],
            [
              3,
            23
            ],
            [
              4,
            1
            ],
            [
              5,
            24
            ]
          ],
          "limit": {
            "min": 1
          },
          "range": {
            "avg": 1.94,
            "max": 5,
            "min": 1
          },
          "unit": "packets"
        },
        "result": "compliant"
      },
      "rtp_sequence": {
        "details": {
          "dropped_packets_count": 0,
          "dropped_packets_samples": [],
          "packet_count": 199
        },
        "result": "compliant"
      },
      "unique_multicast_destination_ip_address": {
        "result": "compliant"
      },
      "unrelated_multicast_addresses": {
        "result": "compliant"
      }
    },
    "error_list": [
    {
      "id": "errors.invalid_delta_packet_ts_vs_rtp_ts"
    }
    ],
    "id": "3b0212a5-8eac-4d59-884c-f95486327db2",
    "media_specific": {
      "packets_per_frame": 5,
      "rate": "60000/1001",
      "scan_type": "interlaced",
      "sub_streams": [
      {
        "did_sdid": 24672,
        "errors": 0,
        "line": 9,
        "num": 0,
        "offset": 1964,
        "packet_count": 74,
        "sub_sub_streams": [
        {
          "filename": "05572c39-4e54-44bf-b8df-d09f1ab662b2.raw",
          "type": "ATC VITC1"
        },
        {
          "filename": "ce7d8c85-19ae-4c5a-9f7d-0dc6cdff1d70.raw",
          "type": "ATC LTC"
        },
        {
          "filename": "0c1c0c02-c0a5-466c-880a-b6174352915d.raw",
          "type": "ATC VITC2"
        }
        ]
      },
      {
        "did_sdid": 24833,
        "errors": 0,
        "line": 9,
        "num": 0,
        "offset": 0,
        "packet_count": 25,
        "sub_sub_streams": [
        {
          "filename": "418aea1e-d62b-4812-8a2f-b3ed0b480582.raw",
          "type": "Details"
        },
        {
          "filename": "d4ae7039-b0c6-4ab5-91d7-99d29ad639a7.raw",
          "type": "NTSC line 21 field 1 CC"
        },
        {
          "filename": "46e523f1-6c99-4c8c-85e2-f776759c930e.raw",
          "type": "NTSC line 21 field 2 CC"
        },
        {
          "filename": "bc99b471-75d5-4027-8280-7d5a89878ddb.raw",
          "type": "DTVCC Channel Packet Data"
        },
        {
          "filename": "c6d0adbb-8693-4d3d-a91a-2a2f5b37e1a3.raw",
          "type": "DTVCC Channel Packet Start"
        }
        ]
      },
      {
        "did_sdid": 16645,
        "errors": 0,
        "line": 9,
        "num": 0,
        "offset": 89,
        "packet_count": 49,
        "sub_sub_streams": [
        {
          "filename": "71071e9a-ba71-481c-96db-a9b91268fdcd.raw",
          "type": "Details"
        }
        ]
      },
      {
        "did_sdid": 16647,
        "errors": 0,
        "line": 575,
        "num": 0,
        "offset": 0,
        "packet_count": 1
      }
      ]
    },
    "media_type": "ancillary_data",
    "network_information": {
      "destination_address": "239.0.1.20",
      "destination_mac_address": "01:00:5e:00:01:14",
      "destination_port": "20000",
      "dscp": {
        "consistent": true,
        "value": 0
      },
      "has_extended_header": false,
      "inter_packet_spacing": {
        "after_m_bit": {
          "avg": 223725,
          "max": 239000,
          "min": 208000
        },
        "regular": {
          "avg": 5412951,
          "max": 16431000,
          "min": 0
        }
      },
      "multicast_address_match": true,
      "payload_type": 100,
      "source_address": "192.168.38.22",
      "source_mac_address": "74:83:ef:00:a6:ed",
      "source_port": "10000",
      "ssrc": 0,
      "valid_multicast_ip_address": true,
      "valid_multicast_mac_address": true
    },
    "pcap": "3167089f-d527-4c64-8d3f-b4c917b4df59",
    "state": "analyzed",
    "statistics": {
      "dropped_packet_count": 0,
      "dropped_packet_samples": [],
      "first_packet_ts": "1541166856591744000",
      "frame_count": 49,
      "last_frame_ts": 2215622112,
      "last_packet_ts": "1541166857409242000",
      "packet_count": 199,
      "packets_per_frame": 5,
      "payload_error_count": 0,
      "wrong_field_count": 0,
      "wrong_marker_count": 0
    }
}
```

#### Timestamped measurement

```json
{
  "time": "2020-08-18T21:11:10.62601064Z",
  "min":0,
  "max":1,
}
```

Not all the values are always required.

#### Frame metadata

```json
{
  "first_packet_ts": 1597785070865937200,
  "last_packet_ts": 1597785070881943300,
  "packet_count":2160,
  "timestamp":856317980
}
```

#### Video packet metadata

```json
{
  "datagram_size": 1228,
    "destination_address": "225.192.10.1",
    "destination_mac_address": "01:00:5e:40:0a:01",
    "destination_port": 20000,
    "ethernet_payload_type": "IPv4",
    "extended_sequence_number": 3806231831,
    "lines": [
    {
      "continuation": false,
      "field_identification": 0,
      "length": 1200,
      "line_number": 361,
      "offset": 480
    }
    ],
    "marker": false,
    "packet_time": 1597785070626386200,
    "payload_type": 96,
    "rtp_timestamp": 856317980,
    "sequence_number": 32023,
    "source_address": "192.168.105.1",
    "source_mac_address": "98:5d:82:97:3f:a3",
    "source_port": 10000,
    "ssrc": 0
}
```

#### Comparison model

This is an example of comparison. This "AVSync" analysis is the most
complicated.

```json
{
    "_id": "5ff7874ab3f86488bfee2c05",
    "id": "6c9f5530-5135-11eb-9881-c1faf0fc39c3",
    "name": "my AV delay measurmenet",
    "owner_id": "266b1b60-35ad-11eb-bc0c-750ec19934e5",
    "date": 1610057546243,
    "type": "compareStreams",
    "config": {
        "comparison_type": "AVSync",
        "user_folder": "/home/ebulist/Documents/list//266b1b60-35ad-11eb-bc0c-750ec19934e5",
        "main": {
            "pcap": "cd038f51-f2c3-4a13-abdd-daf8bbcf8c2b",
            "stream": "c4d1d1c4-c7f3-4ebc-9bfe-b30ccc3a818f",
            "media_type": "audio",
            "first_packet_ts": "1606246989522313652",
            "last_packet_ts": "1606246991340185504",
            "packet_time": "0.125000"
        },
        "reference": {
            "pcap": "cd038f51-f2c3-4a13-abdd-daf8bbcf8c2b",
            "stream": "1bdacee5-baa2-46d9-822e-68a52c091996",
            "media_type": "video",
            "scan_type": "interlaced"
        },
        "media_type": "A/V"
    },
    "result": {
        "delay": {
            "pkt": 65881.25228881836,
            "rtp": 66339.96963500977,
            "actual": 65881.25228881836
        },
        "audioCursor": {
            "pktTs": 1606246989.5922434,
            "rtpTs": 1606246989.5920775,
            "position": 0.03846921852166704
        },
        "videoCursor": {
            "pktTs": 1606246989.5263622,
            "rtpTs": 1606246989.5257375,
            "position": 0
        },
        "transparency": false
    }
}
```
