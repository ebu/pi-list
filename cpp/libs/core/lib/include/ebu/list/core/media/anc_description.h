#pragma once

#include <string>
#include <vector>

namespace ebu_list::media::anc
{
    /*
     * did_sdid is an ancillary data description ID based on the (DID,SDID) pair.
     * bit 31-16: DID
     * bit 16-0: SDID
     *
     * registry: https://smpte-ra.org/smpte-ancillary-data-smpte-st-291
     */
    enum class did_sdid
    {
        MPEG_RECODING_DATA_VANC_SPACE = 0x0808,
        MPEG_RECODING_DATA_HANC_SPACE = 0x080C,
        SDTI_TRANSPORT_IN_ACTIVE_FRAME_SPACE = 0x4001,
        HD_SDTI_TRANSPORT_IN_ACTIVE_FRAME_SPACE = 0x4002,
        LINK_ENCRYPTION_MESSAGE_1 = 0x4004,
        LINK_ENCRYPTION_MESSAGE_2 = 0x4005,
        LINK_ENCRYPTION_METADATA = 0x4006,
        PAYLOAD_IDENTIFICATION_HANC_SPACE = 0x4101,
        AFD_AND_BAR_DATA = 0x4105,
        PAN_SCAN_DATA = 0x4106,
        ANSI_SCTE_104_MESSAGES = 0x4107,
        DVB_SCTE_VBI_DATA = 0x4108,
        MPEG_TS_PACKETS_IN_VANC = 0x4109,
        STEREOSCOPIC_3D_FRAME_COMPATIBLE_PACKING_AND_SIGNALING = 0x410A,
        LIP_SYNC_DATA = 0x410B,
        STRUCTURE_OF_INTER_STATION_CONTROL_DATA = 0x4301,
        SUBTITLING_DISTRIBUTION_PACKET = 0x4302,
        TRANSPORT_OF_ANC_PACKET_IN_AN_ANC_MULTIPACKET = 0x4303,
        ARIB_ERROR_MONITOR = 0x4304,
        ACQUISITION_METADATA_SETS_FOR_VIDEO_CAMERA_PARAMETERS = 0x4305,
        KLV_METADATA_TRANSPORT_IN_VANC_SPACE = 0x4404,
        KLV_METADATA_TRANSPORT_IN_HANC_SPACE = 0x4414,
        PACKING_UMID_AND_PROGRAM_IDENTIFICATION = 0x4444,
        COMPRESSED_AUDIO_METADATA_0 = 0x4501,
        COMPRESSED_AUDIO_METADATA_1 = 0x4502,
        COMPRESSED_AUDIO_METADATA_2 = 0x4503,
        COMPRESSED_AUDIO_METADATA_3 = 0x4504,
        COMPRESSED_AUDIO_METADATA_4 = 0x4505,
        COMPRESSED_AUDIO_METADATA_5 = 0x4506,
        COMPRESSED_AUDIO_METADATA_6 = 0x4507,
        COMPRESSED_AUDIO_METADATA_7 = 0x4508,
        COMPRESSED_AUDIO_METADATA_8 = 0x4509,
        TWO_FRAME_MARKER_IN_HANC = 0x4601,
        WSS_DATA_PER_RDD_8 = 0x5001,
        FILM_CODES_IN_VANC_SPACE = 0x5101,
        ANCILLARY_TIME_CODE = 0x6060,
        TIME_CODE_FOR_HIGH_FRAME_RATE_SIGNALS = 0x6061,
        EIA_708B_DATA_MAPPING_INTO_VANC_SPACE = 0x6101,
        EIA_608_DATA_MAPPING_INTO_VANC_SPACE = 0x6102,
        PROGRAM_DESCRIPTION_IN_VANC_SPACE = 0x6201,
        DATA_BROADCAST_IN_VANC_SPACE = 0x6202,
        VBI_DATA_IN_VANC_SPACE = 0x6203,
        TIME_CODE_IN_HANC_SPACE = 0x6464,
        VITC_IN_HANC_SPACE_= 0x647F,
        GENERIC_TIME_LABEL = 0x6062,
        UNKNOWN = 0xFFFF
    };

    using stream_type = std::pair<std::string, did_sdid>;
    const std::vector<stream_type> stream_types
    {
        {"MPEG recoding data, VANC space (S353)", did_sdid::MPEG_RECODING_DATA_VANC_SPACE},
        {"MPEG recoding data, HANC space (S353)", did_sdid::MPEG_RECODING_DATA_HANC_SPACE},
        {"SDTI transport in active frame space (S305)", did_sdid::SDTI_TRANSPORT_IN_ACTIVE_FRAME_SPACE},
        {"HD-SDTI transport in active frame space (S348)", did_sdid::HD_SDTI_TRANSPORT_IN_ACTIVE_FRAME_SPACE},
        {"Link Encryption Message 1 (S427)", did_sdid::LINK_ENCRYPTION_MESSAGE_1},
        {"Link Encryption Message 2 (S427)", did_sdid::LINK_ENCRYPTION_MESSAGE_2},
        {"Link Encryption Metadata (S427)", did_sdid::LINK_ENCRYPTION_METADATA},
        {"Payload Identification, HANC space (S352)", did_sdid::PAYLOAD_IDENTIFICATION_HANC_SPACE},
        {"AFD and Bar Data (S2016-3)", did_sdid::AFD_AND_BAR_DATA},
        {"Pan-Scan Data (S2016-4)", did_sdid::PAN_SCAN_DATA},
        {"ANSI/SCTE 104 messages (S2010)", did_sdid::ANSI_SCTE_104_MESSAGES},
        {"DVB/SCTE VBI data (S2031)", did_sdid::DVB_SCTE_VBI_DATA},
        {"MPEG TS packets in VANC (ST 2056)", did_sdid::MPEG_TS_PACKETS_IN_VANC},
        {"Stereoscopic 3D Frame Compatible Packing and Signaling (ST 2068)", did_sdid::STEREOSCOPIC_3D_FRAME_COMPATIBLE_PACKING_AND_SIGNALING},
        {"Lip Sync data (ST 2064)", did_sdid::LIP_SYNC_DATA},
        {"Structure of inter-station control data conveyed by ancillary data packets (ITU-R BT.1685)", did_sdid::STRUCTURE_OF_INTER_STATION_CONTROL_DATA},
        {"Subtitling Distribution packet (SDP) (RDD 8)", did_sdid::SUBTITLING_DISTRIBUTION_PACKET},
        {"Transport of ANC packet in an ANC Multipacket (RDD 8)", did_sdid::TRANSPORT_OF_ANC_PACKET_IN_AN_ANC_MULTIPACKET},
        {"Metadata to monitor errors of audio and video signals on a broadcasting chain ARIB", did_sdid::ARIB_ERROR_MONITOR},
        {"Acquisition Metadata Sets for Video Camera Parameters (RDD18)", did_sdid::ACQUISITION_METADATA_SETS_FOR_VIDEO_CAMERA_PARAMETERS},
        {"KLV Metadata transport in VANC space (RP214)", did_sdid::KLV_METADATA_TRANSPORT_IN_VANC_SPACE},
        {"KLV Metadata transport in HANC space (RP214)", did_sdid::KLV_METADATA_TRANSPORT_IN_HANC_SPACE},
        {"Packing UMID and Program Identification Label Data into SMPTE 291M Ancillary Data Packets (RP223)", did_sdid::PACKING_UMID_AND_PROGRAM_IDENTIFICATION},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_0},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_1},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_2},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_3},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_4},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_5},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_6},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_7},
        {"Compressed Audio Metadata (S2020-1)", did_sdid::COMPRESSED_AUDIO_METADATA_8},
        {"Two Frame Marker in HANC (ST 2051)", did_sdid::TWO_FRAME_MARKER_IN_HANC},
        {"WSS data per RDD 8 (RDD 8)", did_sdid::WSS_DATA_PER_RDD_8},
        {"Film Codes in VANC space (RP215)", did_sdid::FILM_CODES_IN_VANC_SPACE},
        {"Ancillary Time Code (S12M-2)", did_sdid::ANCILLARY_TIME_CODE},
        {"Time Code for High Frame Rate Signals (ST 12-3)", did_sdid::TIME_CODE_FOR_HIGH_FRAME_RATE_SIGNALS},
        {"EIA 708B Data mapping into VANC space (S334-1)", did_sdid::EIA_708B_DATA_MAPPING_INTO_VANC_SPACE},
        {"EIA 608 Data mapping into VANC space (S334-1)", did_sdid::EIA_608_DATA_MAPPING_INTO_VANC_SPACE},
        {"Program Description in VANC space (RP207)", did_sdid::PROGRAM_DESCRIPTION_IN_VANC_SPACE},
        {"Data broadcast (DTV) in VANC space (S334-1)", did_sdid::DATA_BROADCAST_IN_VANC_SPACE},
        {"VBI Data in VANC space (RP208)", did_sdid::VBI_DATA_IN_VANC_SPACE},
        {"Time Code in HANC space (Deprecated; for reference only) (RP196 (Withdrawn))", did_sdid::TIME_CODE_IN_HANC_SPACE},
        {"VITC in HANC space (Deprecated; for reference only) (RP196 (Withdrawn))", did_sdid::VITC_IN_HANC_SPACE_},
        {"Generic Time Label (ST 2103 (in development))", did_sdid::GENERIC_TIME_LABEL},
        {"Unknown", did_sdid::UNKNOWN}
    };

    std::string to_string(did_sdid id);
    std::string to_description(did_sdid id);
}
