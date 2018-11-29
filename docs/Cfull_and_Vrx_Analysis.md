# Cfull and Vrx Analysis

## Requirements

- Accuracy:
  - The clock of the capture device must be locked to the same PTP master as the sender device. We use algorithms that try to minimize the impact of a non-locked capture or sender device. However, the results are not guaranteed to be accurate.

- Precision:
  - The capture must be done using nanosecond resolution pcap files.

## Heuristics
- Schedule: LIST does not rely on SDP files, therefore it is doesn't know if the schedule is gapped or linear. Therefore, we use an heuristic to determine that. That heuristic is based on the gap between the capture time of the last packet of one frame and the first packet of the subsequent frame. If that gap is at least 10 times the inter packet spacing of all other packets, we assume the schedule is gapped.

## Vrx Analysis

### Assumptions

We assume that:
- The Vrx buffer should be empty at the begin of each frame. This is not necessarily correct and we will eventually remove this limitation. (see https://github.com/ebu/pi-list/issues/18)

### Algorithms

- Since we don't read SDP files, we are not aware of any announced TRoffset.
- Experience has shown that often the capture device is not correctly locked to the same PTP master as the sender device.

In order to overcome these facts, we use 3 different algorithms to calculate Vrx, as explained below.

#### Tvd = Ideal

In this case, we assume that:
- TRoffset = TROdefault
- Tvd = N x Tframe + TRoffset

Where:
- N is the frame index since the SMPTE epoch
- Tframe is the frame period

(when we say frame above shall be replaced by field for interlaced streams)

#### Tvd = Tvd First Packet First Frame

In order to deal with cases where TRoffset != TROdefault, we assume that:

- TRoffset = Tp0f0 - N x Tframe

Where:
- Tp0f0 is the capture time of the first packet of the first full frame

#### Tvd = Tvd First Packet Each Frame

In order to deal with cases where the capture clock is not PTP-locked, we assume that:

- TRoffset = Tp0 - N x Tframe

Where:
- Tp0 is the capture time of the first packet, reset for every frame

Where:
- Tpacket0 is the capture time of the first packet of the first full frame