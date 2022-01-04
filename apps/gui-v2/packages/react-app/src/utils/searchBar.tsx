import _ from 'lodash';

export const findOne = (target: string, tokens: string[]) => {
    if (_.isNil(target)) return false;
    return tokens.some((token: string) => {
        const regSearch = new RegExp(`.*${token}.*`, 'i');
        return target.match(regSearch);
    });
};
