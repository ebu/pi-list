const { calculateNotCompliant } = require('./utils');

const streamWithErrors = {
    error_list: [{ id: 'errors.invalid_multicast_ip_address' }, { id: 'errors.unrelated_multicast_addresses' }],
};

const streamWithoutErrors = { error_list: [] };

test('calculateNotCompliant', () => {
    expect(calculateNotCompliant([streamWithErrors, streamWithoutErrors])).toStrictEqual(1);
    expect(calculateNotCompliant([streamWithErrors, streamWithErrors])).toStrictEqual(2);
    expect(calculateNotCompliant([streamWithoutErrors, streamWithoutErrors])).toStrictEqual(0);
    expect(calculateNotCompliant([])).toStrictEqual(0);
});
