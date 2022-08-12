import * as express from 'express';

export interface IPcapDefinition {
    uuid: string;
    folder: string;
}

export interface IPcapReqAdditional {
    pcap: IPcapDefinition;
    file: {
        path: string; // Uploaded file path
        filename: string; // The base file name
        originalname: string; // The name of the pcap file
    };
}

export interface IPcapReq extends express.Request, IPcapReqAdditional {}

export function runAnalysis(params: unknown): unknown;
