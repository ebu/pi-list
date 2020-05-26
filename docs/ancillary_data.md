# Ancillary Data

ST 2110-40 embeds ancillary payload according to [SMPTE 291M](https://tools.ietf.org/html/rfc8331)
where each ancillary sub-stream is identified by a DID/SDID pair. LIST
can theorytically detect the presence of any ancillary type and also
detects integrity by counting the payload errors.

With repect to the decoding, third-party [libklvanc](https://github.com/stoth68000/libklvanc)
supports the following types:

 * CEA-708/EIA-608 closed captions
 * SMPTE 12-2 timecode
 * SCTE-104 Ad triggers
 * Active Format Descriptor
 * SMPTE 2038 arbitrary VANC encapsulation

So far, only close caption and timecode are integrated in LIST.
It is mostly tested on North American streams.

## RTP

 * anc must have at least one (keap alive) or more packet per frame
 * in a frame, packets have the same RTP timestamp
 * this number of packets number may vary
 * the frame rate and the media clock are the same as video
 * the last packet of each frame must have the marker bit set
 * just as for video, RTP timestamp delta is logged for every new frame

The delay between packet time and RTP timestamp should be moderate.
Though no range has been defined anywhere, EBU-LIST applies the same
constraints as for video, i.e. [JT-NM tested program](http://jt-nm.org/documents/JT-NM_Tested_Catalog_ST2110_Full-Online-2019-09-10.pdf)
proposes: "The instantaneous value of theRTP timestamp of the stream is
not in the future, not more than 1 ms in the past (unless justified),
and preserves a stable relation to the PTP (should not “drift”)"

## Ancillary header

 * field bits must have acceptable value depending on scan type and
   frame/field transition
 * DID/SDID must be registered values
 * payload intergrity is validated against parity bits and checksum

## Timecode

Supported:

 * ATC LTC
 * ATC VITC1
 * ATC VITC2

## Close caption

Supported:

 * NTSC line 21
 * DTVCC Channel
 * AFD
 * SCTE 104 (only opID is decoded)
