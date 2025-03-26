import React from 'react'
import SyntaxHighlighterCore from 'react-syntax-highlighter/dist/cjs/prism-light'
import theme from 'react-syntax-highlighter/dist/cjs/styles/prism/atom-dark'

const SyntaxHighlighter =
  SyntaxHighlighterCore as typeof import('react-syntax-highlighter').PrismLight
import { useCopy } from '../../hooks/useCopy'

import cpp from 'react-syntax-highlighter/dist/cjs/languages/prism/cpp'
import hs from 'react-syntax-highlighter/dist/cjs/languages/prism/haskell'
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx'
import go from 'react-syntax-highlighter/dist/cjs/languages/prism/go'
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python'
import { Contain } from './index.style'
import { CopyOutlined } from '@ant-design/icons'

export const registerLanguage = (name: string, meta: any) =>
  SyntaxHighlighter.registerLanguage(name, meta)

registerLanguage('tsx', tsx)
registerLanguage('hs', hs)
registerLanguage('cpp', cpp)
registerLanguage('go', go)
registerLanguage('python', python)

export interface CodeBlockProps {
  code: string
  language: string
  className: string
  children: React.ReactNode
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className,
  ...props
}) => {
  // @ts-ignore
  const id = props?.node?.position?.start?.line
  const copyer = useCopy(`${id}`)

  if (/^language-/.test(className) && children) {
    const lang = className.replace(/^language-/, '')
    return (
      <Contain>
        <div className="Paste" ref={copyer.button}>
          <CopyOutlined />
        </div>
        <div ref={copyer.target}>
          <SyntaxHighlighter language={lang} style={theme}>
            {String(children).trim()}
          </SyntaxHighlighter>
        </div>
      </Contain>
    )
  }
  return <>{children}</>
}
