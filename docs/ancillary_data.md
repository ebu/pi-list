# Ancillary Data

ST 2110-40 embeds ancillary payload according to SMPTE 291M where each
ancillary sub-stream is identified by a DID/SDID pair. LIST can
theorytically detect the presence of any ancillary type and also detects
integrity by counting the payload errors.

With repect to the decoding, third-party [libklvanc](https://github.com/stoth68000/libklvanc)
supports the following types:

 * CEA-708/EIA-608 closed captions
 * SMPTE 12-2 timecode
 * SCTE-104 Ad triggers
 * Active Format Descriptor
 * SMPTE 2038 arbitrary VANC encapsulation

So far, only close caption and timecode are integrated in LIST.
It is mostly tested on North American streams.

## Timecode

Supported:

 * ATC LTC
 * ATC VITC1
 * ATC VITC2

## Close caption

Supported:

 * NTSC line 21
 * DTVCC Channel
