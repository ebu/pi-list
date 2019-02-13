# Audio timing measurements

## Delay or Transit Time

The delay is computed as the difference between the packet arrival time
and the RTP timestamp. The precision of the arrival time relies on the
accuracy of the packet timestamping of the capturing device which is
ideally performed by the NIC, provided that its hardware clock is
PTP-synced.

In a minimalist setup composed of an Embrionix SFP source and a
capturing device plugged to the same Arista switch, results showed that
the delay was about 1 packet time.

## TSDF

TSDF stands for TimeStamped Delay Factor and is a
[technical recommendation of EBU](https://tech.ebu.ch/docs/tech/tech3337.pdf)
to address the measurement of network jitter. The calculation is based
on Relative Transit Time between any packet and a reference packet. The
reference packet is the first of a measurement window which is changes
every 200ms.

AES67 recommends that the delay should not exceed 1 packet time and must
stay lower than 17 packets times. These levels are reflected by the
color of TSDF badge of Audio cards in the UI.
