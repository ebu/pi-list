import React from 'react';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import list from 'utils/api';

const getQueryParamAsString = (location: null | string | string[], or: string): string => {
    if (!location) return or;

    if (Array.isArray(location)) {
        return location[0];
    }
    return location;
};

export default () => {
    const history = useHistory();
    const location = useLocation();

    if (location.search) {
        const queryParams = queryString.parse(location.search);

        if (queryParams.token) {
            list.setToken(getQueryParamAsString(queryParams.token, ''));
            history.push(getQueryParamAsString(queryParams.location, '/'));
        }
    }
};
