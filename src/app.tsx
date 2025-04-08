import React from 'react'
import ReactDOM from 'react-dom'

import { MyRuntimeProvider } from './components/MyRuntimeProvider'
import { Thread } from './components/Thread'
import { ThreadList } from './components/ThreadList'
import { Aside, Content, Layout, Root } from './app.style'
import './app.less'

const MyApp = () => {
  return (
    <MyRuntimeProvider>
      <Root>
        <Layout>
          <Aside>
            <ThreadList />
          </Aside>
          <Content>
            <Thread />
          </Content>
        </Layout>
      </Root>
    </MyRuntimeProvider>
  )
}

ReactDOM.render(<MyApp />, document.querySelector('#root'))
