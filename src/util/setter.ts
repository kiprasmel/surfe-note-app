/**
 * similar to react's setState(x):
 * allow also setting value by passing in a function that
 * takes in the current value, and returns a new one.
 */

export type Setter<T> = T | ((currentValue: T) => T);

export function getSetterValue<T>(setter: Setter<T>, currentValue: T): T {
	return setter instanceof Function ? setter(currentValue) : setter;
}
