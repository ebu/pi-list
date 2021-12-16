import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
import { runUploadTimeTest } from './utils';

const addTest = (name: string, test: testUtils.TestFunction) => add(name, test, [requirements.Time]);

[
    '1080p50-narrow-1s-t128.pcap',
    '1080p50-narrow-5s.pcap',
    '1080p50-narrow-5s-t128.pcap',
    '1080p50-narrow-10s-t128.pcap',
    '1080p50-narrow-30s-t128.pcap',
    '1080p50-wide-5s-t128.pcap',
    '2160p50-narrow-5s-t128.pcap',
].forEach((name) => {
    addTest(`Pcap: upload pcap "${name}"`, async (c: testUtils.ITestContext) => runUploadTimeTest(name, c));
});
