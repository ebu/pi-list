import yargs from 'yargs';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { requirements, run as runRepo } from './repo';
import './basic';
import './advanced';
import './time';

const parser = yargs(process.argv.slice(2))
    .usage('Usage: $0 <command> [options]')
    .command('test-basic', 'Run the basic tests (autentication, simple analysis, users, download).')
    .example('$0 test-basic -b https://list.ebu.io', 'Run the basic tests in https://list.ebu.io.')
    .command('test-advanced', 'Run the advanced tests (analysis profile, comparison soon).')
    .example('$0 test-advanced -b https://list.ebu.io', 'Run the advanced tests in https://list.ebu.io.')
    .command('test-time', 'Run the time tests (Upload pcaps duration).')
    .example(
        'EBU_LIST_PCAPS=~/.list/performance_tests $0 time-tests -b https://list.ebu.io',
        'Run the time tests in https://list.ebu.io.'
    )
    .demandCommand(1, 1)
    .alias('p', 'password')
    .nargs('p', 1)
    .describe('p', `The password`)
    .default('p', 'listtest')
    .alias('u', 'username')
    .nargs('u', 1)
    .describe('u', `The username`)
    .default('u', 'listtest')
    .help('h')
    .alias('h', 'help')
    .options({
        b: {
            type: 'string',
            alias: 'address',
            nargs: 1,
            describe: 'Name or IP address of the host',
        },
        u: {
            type: 'string',
            alias: 'username',
            nargs: 1,
            describe: 'Account username',
        },
        p: {
            type: 'string',
            alias: 'password',
            nargs: 1,
            describe: 'Account passsword',
        },
    })
    .demandOption('b')
    .wrap(120)
    .epilog('© 2020 MIPW Lda - All rights reserved');

const argv: {
    _: (string | number)[];
    [x: string]: unknown;
    b: string | undefined;
    u: string | undefined;
    p: string | undefined;
} = parser.argv;

const address = `${argv.b}`;
const user = argv.u as string;
const password = argv.p as string;

async function runAllTests(settings: testUtils.ITestSettings): Promise<number> {
    return runRepo(settings)
        .then((allTestsPassed: boolean) => (allTestsPassed ? 0 : 1))
        .catch((err: Error) => {
            console.error(err);
            return -1;
        });
}

async function runTests(requirement: string): Promise<boolean> {
    console.log('Running the basic tests');
    return runAllTests({
        address: address,
        username: user,
        password: password,
        enabledRequirements: [requirement],
    }).then((result: number) => result !== 0);
}

async function run(): Promise<boolean> {
    for (const arg of argv._) {
        if (arg === 'test-basic') {
            return await runTests(requirements.Basic);
        } else if (arg === 'test-advanced') {
            return await runTests(requirements.Advanced);
        } else if (arg === 'test-time') {
            const ebuListPcaps = process.env.EBU_LIST_PCAPS;
            if (!ebuListPcaps) {
                process.exit(1);
            }
            return await runTests(requirements.Time);
        }
    }

    parser.showHelp();
    return true;
}

run()
    .then((failed: boolean) => (failed ? process.exit(1) : process.exit(0)))
    .catch((err: Error) => {
        console.error(err);
        process.exit(-1);
    });
