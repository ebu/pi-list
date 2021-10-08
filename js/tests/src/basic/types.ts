export interface IArgs {
    _: string[];
    baseUrl: string;
    username: string;
    password: string;
    pcapFile?: string;
}

export interface PcapFileReceived {
    id: string;
    file_name: string;
    pcap_file_name: string;
    data: number;
    progress: number;
}

export interface PcapFileProcessed {
    analyzed: boolean;
    error: any;
    offset_from_ptp_clock: number;
    anc_streams: number;
    audio_streams: number;
    video_streams: number;
    total_streams: number;
    narrow_linear_streams: number;
    narrow_streams: number;
    not_compliant_streams: number;
    wide_streams: number;
    generated_from_network: boolean;
    truncated: boolean;
    _id: string;
    id: string;
    __v: number;
    analyzer_version: string;
    capture_date: number;
    capture_file_name: string;
    date: number;
    file_name: string;
    owner_id: string;
    pcap_file_name: string;
    summary: {};
    progress: number;
}

export interface IProblem {
    stream_id: string | null; // If null, applies to the whole pcap, e.g. truncated
    value: {
        id: string; // Problem id
    };
}

export interface PcapFileProcessingDone {
    analyzed: boolean;
    error: any;
    offset_from_ptp_clock: number;
    anc_streams: number;
    audio_streams: number;
    video_streams: number;
    total_streams: number;
    narrow_linear_streams: number;
    narrow_streams: number;
    not_compliant_streams: number;
    wide_streams: number;
    generated_from_network: boolean;
    truncated: boolean;
    _id: string;
    id: string;
    __v: number;
    analyzer_version: string;
    capture_date: number;
    capture_file_name: string;
    date: number;
    file_name: string;
    pcap_file_name: string;
    analysis_profile: { id: string; label: string; timestamp: { source: string } };
    summary: { error_list: IProblem[]; warning_list: IProblem[] };
    progress: number;
}

export type EventSpecificInfo = PcapFileReceived | PcapFileProcessed | PcapFileProcessingDone;
export type EventType = 'PCAP_FILE_RECEIVED' | 'PCAP_FILE_PROCESSED' | 'PCAP_FILE_PROCESSING_DONE';

export interface IEventInfo {
    event: EventType;
    data: EventSpecificInfo;
}
