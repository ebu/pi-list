export default {
    findAndUpdateElementInArray: (attribute, array, updateObject) => {
        const key = Object.keys(attribute)[0];

        const elementIndex = array.findIndex(
            element => element[key] === attribute[key]
        );

        return [
            ...array.slice(0, elementIndex),
            Object.assign({}, array[elementIndex], updateObject),
            ...array.slice(elementIndex + 1),
        ];
    },

    findAndRemoveElementInArray: (attribute, array) => {
        const key = Object.keys(attribute)[0];

        return array.filter(element => element[key] !== attribute[key]);
    },
};
