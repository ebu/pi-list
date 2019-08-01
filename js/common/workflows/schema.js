/* Workflow schema:
{
    id : string (uuid),
    type: type (see types),
    state: {
        status: string (see status),
        errorMessage : status == status.failed ? string | undefined,
    },
    meta: {
        createdBy: string (user id),
        times: {
            created: Date (readonly),
            lastUpdated: undefined | Date,
            completed: undefined | Date,
        },
    },
    configuration: any (workflow specific),
}
*/

const status = {
    requested: 'requested',
    started: 'started',
    failed: 'failed', // payload : { message: string }
    completed: 'completed',
};

module.exports = {
    status,
};
