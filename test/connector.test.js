import { Component, render } from 'inferno'
import { createStoreon } from 'storeon'
import {
  renderIntoContainer,
  findRenderedVNodeWithType
} from 'inferno-test-utils'

import { connectStoreon } from '../index'

class Passthrough extends Component {
  render () {
    return <div />
  }
}

class ProviderMock extends Component {
  getChildContext () {
    return { storeon: this.props.store }
  }

  render () {
    return this.props.children
  }
}

const unmountDOM = elm => render(null, elm)

function increment (store) {
  store.on('@init', () => ({ count: 0, foo: 'baz' }))
  store.on('inc', state => ({ count: state.count + 1 }))
  store.on('set', (_, data) => ({ foo: data }))
}

it('should receive the store in the context', () => {
  let store = createStoreon([])

  let Container = connectStoreon(
    class Container extends Component {
      render () {
        return <Passthrough {...this.props} />
      }
    }
  )

  let tree = renderIntoContainer(
    <ProviderMock store={store}>
      <Container pass="through" />
    </ProviderMock>
  )

  let container = findRenderedVNodeWithType(tree, Container).children
  expect(container.context.storeon).toBe(store)
})

it('should pass state and props to the given component', () => {
  let store = createStoreon([increment])

  let Container = connectStoreon('count', 'foo',
    class Container extends Component {
      render () {
        return <Passthrough {...this.props} />
      }
    }
  )

  let tree = renderIntoContainer(
    <ProviderMock store={store}>
      <Container pass="through" foo="bar" />
    </ProviderMock>
  )

  let stub = findRenderedVNodeWithType(tree, Passthrough).children
  expect(stub.props.count).toBe(0)
  expect(stub.props.foo).toBe('baz')
  expect(stub.props.dispatch).toBe(store.dispatch)
  findRenderedVNodeWithType(tree, Container)
})

it('should subscribe class components to the store changes', () => {
  let store = createStoreon([increment])

  let Container = connectStoreon('count',
    class Container extends Component {
      render () {
        return <Passthrough {...this.props} />
      }
    }
  )

  let vNode = (
    <ProviderMock store={store}>
      <Container />
    </ProviderMock>
  )
  let tree = renderIntoContainer(vNode)

  let stub = findRenderedVNodeWithType(tree, Passthrough).children
  expect(stub.props.count).toBe(0)

  store.dispatch('inc')
  renderIntoContainer(vNode)
  expect(stub.props.count).toBe(1)

  store.dispatch('set', 'bar')
  renderIntoContainer(vNode)
  expect(stub.props.count).toBe(1)
})

it('should subscribe pure function components to the store changes', () => {
  let store = createStoreon([increment])

  let Container = connectStoreon('count', props => {
    return <Passthrough {...props} />
  })

  let vNode = (
    <ProviderMock store={store}>
      <Container />
    </ProviderMock>
  )
  let tree = renderIntoContainer(vNode)

  let stub = findRenderedVNodeWithType(tree, Passthrough).children
  expect(stub.props.count).toBe(0)

  store.dispatch('inc')
  renderIntoContainer(vNode)
  expect(stub.props.count).toBe(1)
})

it('should unsubscribe before unmounting', () => {
  let store = createStoreon([increment])
  let on = store.on

  // Keep track of unsubscribe by wrapping subscribe()
  let unsubscribeCalls = 0
  store.on = (event, listener) => {
    let unbind = on(event, listener)
    return () => {
      unsubscribeCalls++
      return unbind()
    }
  }

  let Container = connectStoreon('count',
    class Container extends Component {
      render () {
        return <Passthrough {...this.props} />
      }
    }
  )

  let div = document.createElement('div')
  render(
    <ProviderMock store={store}>
      <Container />
    </ProviderMock>,
    div
  )

  expect(unsubscribeCalls).toBe(0)
  unmountDOM(div)
  expect(unsubscribeCalls).toBe(1)
})

it('should throw a helpful error when store not provided', () => {
  let Container = connectStoreon('count',
    class Container extends Component {
      render () {
        return <div />
      }
    }
  )

  expect(() => renderIntoContainer(<Container/>)).toThrow(Error)
})
