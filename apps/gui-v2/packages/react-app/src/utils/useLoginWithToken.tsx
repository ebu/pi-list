import React from 'react';
import queryString from 'query-string';
import { useNavigate, useLocation } from 'react-router-dom';
import list from 'utils/api';

const getQueryParamAsString = (location: null | string | (string | null)[], or: string): string => {
    if (!location) return or;

    if (Array.isArray(location)) {
        return location[0] || or;
    }
    return location;
};

export default () => {
    const navigate = useNavigate();
    const location = useLocation();

    if (location.search) {
        const queryParams = queryString.parse(location.search);

        if (queryParams.token) {
            list.setToken(getQueryParamAsString(queryParams.token, ''));
            navigate(getQueryParamAsString(queryParams.location, '/'));
        }
    }
};
