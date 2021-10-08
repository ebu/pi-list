# Audio timing measurements

These measurements are based on the packet arrival time and the RTP timestamp.

Tolerances depend on the user analysis profile. Profiles are defined in
`apps/listwebserver/enums/analysis.js` and can be selected in user settings.

The precision of the arrival time relies on the accuracy of the packet
timestamping of the capturing device which is ideally performed by the
NIC, provided that its hardware clock is PTP-synced.

In a minimalist setup composed of an Embrionix SFP as source and a
capturing device plugged to the same Arista switch, results showed that
the delay was about 1 packet time.

## RTP timestamp validation

`Delta Packet vs RTP`:

[JT-NM TESTED program - 5.3](https://static.jt-nm.org/documents/JT-NM_Tested_Catalog_ST2110_Full-Online-2020-05-12.pdf)
says that the delta between arrival time and RTP timestamp must not be
negative (RTP time in the future) and lower than 1ms (in the past).

CBC profile tolerates values depending on the packet time, as opposed to
previous packet-time-agnostic requirement. The acceptable delay equals
the packetization(1pkt) + transit time(1pkt) + jitter (which depends on
the nature the source. i.e. narrow(1pkt) / wide(17pkt)). This
requirement accomodates software-based senders for which sporadic peaks
of jitter appear. Nevertheless, it's expected that the delta stays small
most of time. So in addition to the maximum permitted value of the
delta, average delta is also constrained.

Implemented compliance tests tolerate the most permissive case, i.e.
wide stream.

| *Packet time* | *Narrow Sender* | *Wide Sender* |
|----|----|----|
| 1ms   | max<3ms   | max<20ms, avg<2.5ms  |
| 125us | max<375us | max<2.5ms, avg<375us |

## TS-DF

`TimeStamped Delay Factor`:

[technical recommendation of EBU](https://tech.ebu.ch/docs/tech/tech3337.pdf)
addresses the measurement of network jitter. The calculation is based
on Relative Transit Time between any packet and a reference packet. The
reference packet is the first of a measurement window which is changes
every 200ms.

Tweaking the formula allows to use the delta between RTP TS and paket
TS.

AES67 recommends that the delay should not exceed 1 packet time and must
stay lower than 17 x packet time. These levels are reflected by the
color of TSDF badge of Audio cards in the UI.
