import { Component } from 'inferno'
import { createStoreon } from 'storeon'
import {
  renderIntoContainer,
  findRenderedVNodeWithType
} from 'inferno-test-utils'

import { StoreonProvider } from '../index'

class Child extends Component {
  render () {
    return <div></div>
  }
}

it('connects component to store', () => {
  let store1 = createStoreon([])
  let store2 = createStoreon([])

  let spy = jest.spyOn(console, 'error')

  let vNode = store => (
    <StoreonProvider store={store}>
      <Child />
    </StoreonProvider>
  )

  let tree = renderIntoContainer(vNode(store1))
  expect(spy.mock.calls).toHaveLength(0)

  let child = findRenderedVNodeWithType(tree, Child).children
  expect(child.context.storeon).toBe(store1)

  tree = renderIntoContainer(vNode(store2))

  expect(spy.mock.calls).toHaveLength(0)

  child = findRenderedVNodeWithType(tree, Child).children
  expect(child.context.storeon).toBe(store2)
})

it('should warn once when receiving a new store in props', () => {
  let counter = state => store => store.on('@init', () => ({ state }))
  let store1 = createStoreon([counter(11)])
  let store2 = createStoreon([counter(20)])
  let store3 = createStoreon([counter(100)])

  class ProviderContainer extends Component {
    constructor () {
      super()
      this.state = { store: store1 }
    }

    render () {
      return (
        <StoreonProvider store={this.state.store}>
          <Child />
        </StoreonProvider>
      )
    }
  }

  let vNode = <ProviderContainer />
  let container = renderIntoContainer(vNode)
  let child = findRenderedVNodeWithType(container, Child).children
  expect(child.context.storeon.get().state).toEqual(11)

  let spy = jest.spyOn(console, 'error')
  container.setState({ store: store2 })
  renderIntoContainer(vNode)

  expect(child.context.storeon.get().state).toEqual(11)
  expect(spy.mock.calls).toHaveLength(1)
  expect(spy.mock.calls[0]).toEqual([
    '<StoreonProvider> does not support changing `store` on the fly.'
  ])

  container.setState({ store: store3 })
  renderIntoContainer(vNode)

  expect(child.context.storeon.get().state).toEqual(11)
  expect(spy.mock.calls).toHaveLength(2)
})
