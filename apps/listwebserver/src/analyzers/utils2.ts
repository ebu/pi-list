import { api } from '@bisect/ebu-list-sdk';

export function selectAnalyses(
    mediaType: api.pcap.MediaType,
    fullMediaType: api.pcap.FullMediaType,
    profile: api.pcap.IAnalysisProfile
): api.pcap.Validations {
    return {
        ...profile.validationMap.common,
        ...profile.validationMap[mediaType],
        ...profile.validationMap[fullMediaType],
    };
}
