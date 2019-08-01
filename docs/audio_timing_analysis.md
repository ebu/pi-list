# Audio timing measurements

## RTP timestamp validation

[JT-NM TESTED program](http://jt-nm.org/documents/JT-NM_Tested_Catalog_Full-Online-2019-04-05.pdf)
recommends to compute the delta between the packet arrival time
(corresponding to PTP time) and the RTP timestamp. The value must not
be negative (RTP time in the future) and lower than 500ms (in the past).
These permitted range is hardcoded in apps/listwebserver/analyzers/audio.js
but would eventually be adjustable.

The precision of the arrival time relies on the
accuracy of the packet timestamping of the capturing device which is
ideally performed by the NIC, provided that its hardware clock is
PTP-synced.

In a minimalist setup composed of an Embrionix SFP source and a
capturing device plugged to the same Arista switch, results showed that
the delay was about 1 packet time.

## TimeStamped Delay Factor (TSDF)

[technical recommendation of EBU](https://tech.ebu.ch/docs/tech/tech3337.pdf)
addresses the measurement of network jitter. The calculation is based
on Relative Transit Time between any packet and a reference packet. The
reference packet is the first of a measurement window which is changes
every 200ms.

Tweaking the formula allows to use the delta between RTP TS and paket
TS.

AES67 recommends that the delay should not exceed 1 packet time and must
stay lower than 17 packets times. These levels are reflected by the
color of TSDF badge of Audio cards in the UI.
