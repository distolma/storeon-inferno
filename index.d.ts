import { Component, InfernoNode, ComponentType } from 'inferno'
import { StoreonStore } from 'storeon'

interface Props {
  store: StoreonStore<any, any>;
  children?: InfernoNode;
}

/**
 * HOC to provide store for `connectStoreon` decorator.
 *
 * ```js
 * import { render } from 'inferno'
 * import { StoreonProvider } from 'storeon-inferno'
 * import { store } from './store'
 *
 * render(
 *   <StoreonProvider store={store}>
 *     <App />
 *   </StoreonProvider>,
 *   document.body
 * )
 * ```
 */
export declare class StoreonProvider extends Component<Props, null> {}

/**
 * Connect Inferno components to the store.
 *
 * ```js
 * import { connectStoreon } from 'storeon-inferno'
 *
 * const Counter = ({ count, dispatch }) => {
 *   return <div>
 *     {count}
 *     <button onClick={() => dispatch('inc')}>inc</button>
 *   </div>
 * }
 * export default connectStoreon('count', Counter)
 * ```
 *
 * @returns Wrapped component.
 */
export function connectStoreon<ComponentProps>(
  ...keysOrComponent: Array<PropertyKey | ComponentType<ComponentProps>>
): Component<Partial<Omit<ComponentProps, "dispatch">>>
