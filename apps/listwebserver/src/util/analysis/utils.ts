import { IPcapDefinition } from './index';
import { getUserId } from '../../auth/middleware';
import program from '../programArguments';
import { v4 as uuid } from 'uuid';

export function getUserFolderFromUserId(userId: string): string {
    return `${program.folder}/${userId}`;
}

export function getUserFolder(req: unknown): string {
    const userId = getUserId(req);
    if (userId === undefined) throw new Error('User is not defined');
    return getUserFolderFromUserId(userId);
}

export function generateRandomPcapFilename(file: { originalname: string }) {
    const extensionCharIdx = file.originalname.lastIndexOf('.');
    const fileExtension = extensionCharIdx > -1 ? '.' + file.originalname.substring(extensionCharIdx + 1) : '';

    return `${Date.now()}_${uuid()}${fileExtension}`;
}

export function generatePcapDefinitionFromId(userId: string, pcapId: string): IPcapDefinition {
    return {
        uuid: pcapId,
        folder: `${getUserFolderFromUserId(userId)}/${pcapId}`,
    };
}

export function generateRandomPcapDefinition(
    req: { query?: { [name: string]: string } },
    optionalPcapId?: string
): IPcapDefinition {
    const pcapId = optionalPcapId || req.query?.pcapID || uuid();
    const userId = getUserId(req);
    return generatePcapDefinitionFromId(userId, pcapId);
}

export function getPcapFolder(userId: string, pcapId: string): string {
    return `${getUserFolderFromUserId(userId)}/${pcapId}`;
}
