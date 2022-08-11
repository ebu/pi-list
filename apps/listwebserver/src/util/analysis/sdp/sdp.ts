import { api } from '@bisect/ebu-list-sdk';
import Pcap from '../../../models/pcap';
import loggerFactory from '../../logger';
import { parseSDPs, getMappingsFromSDPs } from './sdpParser';
const logger = loggerFactory('parse-sdp');

function mapSdpsToStreams(pcapData: unknown) {
    // const sdps = pcapData.sdps;
    // let sdpsParsed = [];
    // if (!sdps) return;
    // sdps.map((sdp) => {
    //     const sdpParsed = sdpToSource(sdp);
    //     sdpsParsed.push(sdpParsed)
    // })
    // let sdp_count = 0;
    // Stream.find({
    //         pcap: pcapData.id
    //     }).exec()
    //     .then((streamsData) => {
    //         streamsData.map((stream) => {
    //             const streamDestinationAddress = stream.network_information.destination_address;
    //             const streamDestinationPort = stream.network_information.destination_port;
    //             sdpsParsed.map((sdp) => {
    //                 const sdpDestinationAddress = sdp.sdp.streams[0].dstAddr;
    //                 const sdpDestinationPort = (sdp.sdp.streams[0].dstPort).toString();
    //                 if (streamDestinationAddress === sdpDestinationAddress && streamDestinationPort === sdpDestinationPort) {
    //                     sdp_count++;
    //                     Stream.findOneAndUpdate({
    //                             id: stream.id
    //                         }, {
    //                             sdp: sdp
    //                         }, {
    //                             upsert: true
    //                         }).exec()
    //                         .then(() => {
    //                             const filteredSdps = pcapData.sdps.filter(sdpFromPcap => sdpFromPcap !== sdp.sdp.raw);
    //                             Pcap.findOneAndUpdate({
    //                                 id: pcapData.id
    //                             }, {
    //                                 sdps: filteredSdps,
    //                                 sdp_count: sdp_count
    //                             }, {
    //                                 upsert: true
    //                             }).exec()
    //                         });
    //                 }
    //             })
    //         })
    //     })
}

export async function parseSdps(req: any, res: any, next: any) {
    try {
        const pcapData: api.pcap.IPcapInfo = await Pcap.findOne({
            id: req.pcap.uuid,
        }).exec();

        if (!pcapData) {
            next();
            return;
        }

        const sdps = pcapData.sdps ?? [];
        const parsed_sdps = parseSDPs(sdps);
        const media_type_map = getMappingsFromSDPs(parsed_sdps);

        await Pcap.findOneAndUpdate(
            {
                id: pcapData.id,
            },
            {
                parsed_sdps,
                media_type_map,
            },
            {
                upsert: true,
            }
        ).exec();

        next();
    } catch (err) {
        logger.error(`Exception processing SDP: ${err}`);
        next(err);
    }
}
