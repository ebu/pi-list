import sdk from '@bisect/ebu-list-sdk';
import util from 'util';
// import {} from '../util/filesystem';
import fs from 'fs';
import { basename, join } from 'path';
import { generatePcapDefinitionFromId } from '../util/analysis/utils';
import { IPcapReq } from '../util/analysis';
const mkdir = util.promisify(fs.mkdir);
const link = util.promisify(fs.link);

export async function localUpload(
    userId: string,
    pcapId: string,
    params: sdk.api.pcap.ILocalPcapAnalysisParams
): Promise<IPcapReq> {
    const pcap = generatePcapDefinitionFromId(userId, pcapId);
    await mkdir(pcap.folder, { recursive: true });
    const filename = basename(params.path);
    const localPath = join(pcap.folder, filename);

    const file = {
        path: localPath,
        filename,
        originalname: params.name,
    };
    await link(params.path, localPath);

    return { pcap, file };
}
