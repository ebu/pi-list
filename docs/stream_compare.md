# Stream compare

## Use cases

* A. get a sense the evolution of a media across a processing unit by comparing the input and the output
* B. compare the output of 2 pipelines taking the same stream as input
* C. validate the network redundancy (ST 2022-7)
* D. measure the audio-video synchronicity for eventual re-alignment (ancillary is a todo)

![comp](./comparision_use_cases.png)

## A) Delay and transparency
## B) Network path comparison

Those 2 usecases are actually similar, only the interpretation of the result differs.

The idea consists in probing and comparing 2 streams reflecting the same content but at 2 different `logical points` of the network, i.e. multicast groups.
This type of inter-stream analysis aims at measuring the *propagation delay through the network path* and determine the *transparency of a processing chain*.
Regarless of the media type, the algorithm takes as input 2 extracted paloads: the `reference`, which is most likely the earliest and the `main` (terminology inspired by ffmpeg).
Since RTP timestamp can be overwritten by any processing equipment, it doesn't provide a reliable measurement reference and *media-content-based* analysis is preferred.

[Video-to-video: PSNR](./v2v_comparison.md)

[Audio-to-audio: cross-correlation](./a2a_comparison.md)

## C) Redundancy test

[SMPTE ST 2022-7](./ST_2022-7.md)

## D) A/V synchronicity

[Audio-to-video: manual sync measurement](./a2v_sync.md)
