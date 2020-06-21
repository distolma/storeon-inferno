const { Component, createComponentVNode, normalizeProps } = require('inferno')

// See all flags at: https://git.io/JvhHP
const COMPONENT_UNKNOWN_FLAG = 2

function memo (factory) {
  let state = {}

  return args => {
    if (state._args !== args) {
      state._args = args
      state._factory = factory
      return (state._value = factory())
    }

    return state._value
  }
}

class StoreonProvider extends Component {
  constructor (props, context) {
    super(props, context)
    this.store = props.store
  }

  getChildContext () {
    return { storeon: this.store }
  }

  render (props) {
    return props.children
  }
}

StoreonProvider.displayName = 'StoreonProvider'

if (process.env.NODE_ENV !== 'production') {
  StoreonProvider.prototype.componentWillReceiveProps = function (nextProps) {
    if (this.store !== nextProps.store) {
      console.error(
        '<StoreonProvider> does not support changing `store` on the fly.'
      )
    }
  }
}

let connectStoreon = (...keys) => {
  let WrappedComponent = keys.pop()

  return class extends Component {
    constructor (props, context) {
      super(props, context)

      this.state = { tick: 0 }
      this.storeonPropsFactory = memo(() => {
        let data = {}
        let state = this.context.storeon.get()
        keys.forEach(key => {
          data[key] = state[key]
        })
        data.dispatch = this.context.storeon.dispatch
        return data
      })
    }

    componentWillMount () {
      if (process.env.NODE_ENV !== 'production' && !this.context.storeon) {
        throw new Error(
          'Could not find storeon context value. ' +
            'Please ensure the component is wrapped in a <StoreonProvider>'
        )
      }
    }

    componentDidMount () {
      this.unbind = this.context.storeon.on('@changed', (_, changed) => {
        let changesInKeys = keys.some(key => key in changed)
        if (changesInKeys) this.setState(({ tick }) => ({ tick: ++tick }))
      })
    }

    componentWillUnmount () {
      this.unbind()
    }

    render (props, state) {
      let storeonProps = this.storeonPropsFactory(state.tick)

      return normalizeProps(
        createComponentVNode(COMPONENT_UNKNOWN_FLAG, WrappedComponent, {
          ...props,
          ...storeonProps
        })
      )
    }
  }
}

module.exports = { connectStoreon, StoreonProvider }
