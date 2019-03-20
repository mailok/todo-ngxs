import { StateOperator } from '@ngxs/store';

import { Predicate } from '@ngxs/store/operators/internals';
import { findIndices, invalidIndexs, isArrayNumber, isObject, isPredicate, isStateOperator } from './utils';

/**
 * @param selector - Array of indices or a predicate function
 * that can be provided in `Array.prototype.findIndex`
 * @param operatorOrValue - New value under the `selector` index or a
 * function that can be applied to an existing value
 */
export function updateManyItems<T>(
    selector: number[] | Predicate<T>,
    operatorOrValue: Partial<T> | StateOperator<T>
): StateOperator<T[]> {
    return function updateItemsOperator(existing: Readonly<T[]>) {
        let indices = [];
        if (!selector || !operatorOrValue) {
            return existing;
        }
        if (!existing) {
            return existing;
        }
        if (isPredicate(selector)) {
            indices = findIndices(selector, existing);
        } else if (isArrayNumber(selector)) {
            indices = selector;
        }

        if (invalidIndexs(indices, existing)) {
            return existing;
        }
        let values: Record<number, T> = {};

        if (isStateOperator(operatorOrValue)) {
            values = indices.reduce((acc, it) => ({ ...acc, [it]: operatorOrValue(existing[it]) }), {});
        } else {
            values = indices.reduce(
                (acc, it) =>
                    isObject(existing[it])
                        ? { ...acc, [it]: { ...existing[it], ...operatorOrValue } }
                        : { ...acc, [it]: operatorOrValue },
                {}
            );
        }

        const clone = [...existing];
        const keys = Object.keys(values);
        for (const i in keys) {
            clone[keys[i]] = values[keys[i]];
        }
        return clone;
    };
}
