export interface IPcapDefinition {
    uuid: string;
    folder: string;
}

export interface IPcapReq {
    pcap: IPcapDefinition;
    file: {
        path: string; // Uploaded file path
        filename: string; // The base file name
        originalname: string; // The name of the pcap file
    };
}

export function runAnalysis(params: unknown): unknown;
