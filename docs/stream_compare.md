# Stream compare

The idea is to cover these usecases:

* get a sense the evolution of a media accross a production pipeline by comparing 2 streams, e.g. the input and the output of a processing unit
* validate the network redundancy (ST 2022-7)
* measure the inter-essence synchronicity for futur re-alignement
* since RTP can't use as a reliable measurement reference, media content comparison is the base this implementation

Regarless of the media type, algorithm takes as input 2 decoded and extracted and decoded streams. The `reference`, which is most likely the earliest and the `main` (terminology inspired by ffmpeg).

## Video-to-video

### Results

- *Maximum of PSNR*: the maximum of the PSNR between the `ref` frame/field and every frame/field of the `main` sequence
- *Actual delay*: the difference between the capture timestamps of the `ref` frame/field and the most similar `main` frame/field
- *Media delay*: actual delay converted in media units
- *RTP delay*: the difference between the RTP timestamps of the `ref` frame/field and the most similar `main` frame/field

### Algo

The algorithm consisting in picking a frame in the `reference` video sequence, search for is position in `main` sequence, measure the delay and determine if the content was altered.

### Notes

* positive values means `main` is later than `reference`
* ffmpeg returns `inf` value for perfectly equal images. This is associated to value `100` in graphes
* if video is interlace, then PSNR operation is performed on fields

# Limitations

* decoded frames/fields are .PNG files so pixels are 8-bit per color channel instead of the initial 10-bit
* the scan type of both `main` and `reference` stream must be the same type
* the size of the moving analysis window is 1 frame/field; it could be 3 or 5 to improve reliability but tests have proven satisfying performance

### Todo

* schematic for algo
* consider capture delay

## Audio-to-audio

Analysis relies on [cross-correlation](https://en.wikipedia.org/wiki/File:Comparison_convolution_correlation.svg) performed on single-channel PCM. Therefore the user is required to select the audio channel in addition to pcap and stream.

### Results

Intermediate results:

- *Cross-Correlation Graph* shows a 400-sample-wide window around the peak
- *Relative Delay* sample shift associated to Maximum Cross-Correlation. Value in milliseconds is derived from sampling rate.

Displayed results:

- *Maximum Cross-Correlation*: maximum of the cross-correlation array, between [-1, 1], used to determine the transparency (the media is exactly the same) if the peak is above 0.99.
- *Actual Delay* = Relative Delay + Capture Delay, like for video, actual delay determines if `main` is later (>0) or earlier (<0) than `reference`.
- *Capture Delay* As opposed to video frames, not all the PCM samples are not timestamped. We only export the capture timestamp of the 1st and last packets. The 2 PCM arrays may be not perfectly simualtaneous. The difference between the capture time of the 1st packets of each stream reflects this possible delay.

### Algo

A first cross-correlation gives an accurate relative delay (in samples) but max value is degraded by the non-overlapping samples. In other words, with 2 identical audio signal, the larger the delay is, the less common samples the 2 arrays have and the lower the cross-correlation is. To overcome this limitation, we keep all the common samples, based on measured delay, and put all the others to 0. Then a second pass is performed on these modified arrays to achieve a more accurate transparency test.

### Limitation:

- the nodejs dependencies (abr-xcorr and dsp.js) require 16-bit samples as input.
- in order to keep the measurement accurate, the user must use his judgment to adjust the capture setttings according to the expected result. For instance, the capture duration should be a few seconds if the expected delay is 500ms.

### Todo:

* report the first packet RTP timestamp difference
