# Parameters Explained

## SMPTE ST 2110-21

| Parameter | Explanation |
| ------ | ------ |
| C<sub>INST</sub>  | This parameter indicates the instantaneous value of the network compatibility model C as defined in SMPTE ST 2110-21 |
| C<sub>MAX</sub> | This parameter indicates the maximum allowed value that C<sub>INST</sub> shall not exceed. This value is dependend on the type of sender, the video format and the packing of the video. A narrow sender has a tighter packet pacing on the network and will have a lower allowed C<sub>MAX</sub> value than a wide sender. Both sender type are limited in their burstiness. |
| VRX | This parameter indiactes the measured level of the virtual receive buffer, VRX as defined in SMPTE ST 2110-21 |
| VRX<sub>Full</sub> |  This parameter indicates the maximum allowed value the VRX buffer. This value is dependend on the type of sender, the video format and the packing of the video. A narrow sender has a smaller receiving buffer and will have a lower allowed VRX<sub>Full</sub> value than a wide sender. Both sender type are limited in their burstiness. |
| TRO<sub>Default</sub> | This value indicates the default offset between N*Tframe and the first packet of a field or frame to be read. |
| TP<i>A</i><sub>0</sub> | This parameter gives the actual time a packet arrives. The index indicates the first packet of a field or frame. |
| FPO | First Packet Offset is a calculated value for each field or frame and it calculated as follows: TP<i>A</i><sub>0</sub> - N * T<sub>FRAME</sub>. In theory this value is exact the same value as TRO<sub>Default</sub>. In practise this value will be a bit smaller, as a result of this difference some packets will be sinked into the VRX buffer.|
| Margin | TP<i>A</i><sub>0</sub> - TP<i>R</i><sub>0</sub> |

## RTP Timestamps

| Parameter | Explanation |
| ------ | ------ |
| RTP<sub>Time2Reference</sub> | RTP<sub>Time2Reference</sub> = RTP<sub>Timestamp</sub> - N*Tframe |
| RTP<sub>Time2TP<i>A</i><sub>0</sub></sub>| RTP<sub>Time2TP<i>A</i><sub>0</sub></sub> = RTP<sub>Timestamp</sub> - TP<i>A</i><sub>0</sub> |

![Packet Arrival](parameters_explained_1.png)
