# Stream compare

The idea is to cover these usecases:

* get a sense the evolution of a media accross a production pipeline by comparing 2 streams, e.g. the input and the output of a processing unit
* validate the network redundancy (ST 2022-7)
* measure the inter-essence synchronicity for futur re-alignement

Regarless of the media type, algorithm takes as input 2 decoded and extracted and decoded streams. The `reference`, which is most likely the earliest and the `main` (terminology inspired by ffmpeg).

## Video-to-video

### Algo

The algorithm consisting in picking a frame in the `reference` video sequence, search for is position in `main` sequence, measure the delay and determine if the content was altered.

* select the frame/field in the middle of `reference` sequence
* iterate over the frames/fields of `main` sequence:
    - calculate the PSNR between each `reference` and `main` frames/fields
    - calcalute RTP TS delta and packet TS delta
* find the maximum value of PSNR in the result list
* define `main` frame/field as the one which gives this max
* determine if the media was altered or not (PSNR='inf')
* determine the corresponding actual delta between the 2 streams in multiple units:
    - nanoseconds, between the capture time of the 1st packets of the 2 frames/fields
    - RTP ticks, between the RTP timestamps of the 2 frames/fields
    - frames/fields, given by the index of maximum PSNR in the list
* deduce lines and pixels offset from decoded packets (instead of calculating from nanosec delay because it depends on read schedule, `linear` or `gapped`)
    - in `main` frame, pickup the capture time of 1st packet (line=0, pixel=0)
    - find the packet with closest capture time in `reference` sequence
    - get line and pixel from that packet
    - invert if delay is negative
    - adjust frame/field delta (-/+1) if necessary

### Notes

* decoded frames/fields are .PNG files so pixels are 8-bit per color channel instead of the initial 10-bit
* positive values means `main` is later than `reference`
* ffmpeg returns `inf` value for perfectly equal images. This is associated to value `100` in graphes
* if video is interlace, then PSNR operation is performed on fields
* the scan type of both `main` and `reference` stream must be the same type
* due to algo complexity, lines and pixels may be not accurate for negative delays; this is why it is recommended to selected `reference` stream as the earliest
* the size of the moving analysis window is 1 frame/field; it could be 3 or 5 to improve reliability but tests have proven satisfying performance

### Todo

* schematic for algo
* rework lines and pixels offset calculation
* consider capture delay
* document same way as audio

## Audio-to-audio

Analysis relies on cross-correlation performed on single-channel PCM. Therefore the user is required to select the audio channel in addition to pcap and stream. The nodejs dependencies (abr-xcorr and dsp.js) require 16-bit samples as input. ffmpeg ensure that data fits these 2 constraints.

- *Maximum Cross-Correlation*: maximum of the cross-correlation array, between [-1, 1], used to determine the transparency (the media is exactly the same) if the peak is above 0.99.
- *Relative Delay* sample shift associated to Maximum Cross-Correlation. Value in milliseconds is derived from sampling rate.
- *Capture Delay* the 2 streams may be not perfectly simualtaneous. The difference between the capture time of the 1st packets of each stream reflects this possible delay.
- *Actual Delay* = Relative Delay + Capture Delay
- *Cross-Correlation Graph* shows a 500-sample-wide window around the peak

Like for video, actual delay determines if `main` is later (>0) or earlier (<0) than `reference`.

TODO:
* report the first packet RTP timestamp difference
