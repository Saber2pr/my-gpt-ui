import ClipboardJS from 'clipboard'
import { useEffect, useRef } from 'react'

export const useCopy = <
  Button extends HTMLElement = any,
  Target extends HTMLElement = any,
>(
  id: string,
  init: (cp: ClipboardJS) => void | VoidFunction = (cp) => {
    cp.on('success', () => {})
  },
  deps: any[] = [],
) => {
  const ref = useRef<Button>()
  const targetRef = useRef<Target>()
  useEffect(() => {
    const targetId = `Clipboard-Target-${id || Date.now()}`
    if (ref.current) {
      ref.current.setAttribute('data-clipboard-target', `#${targetId}`)
    } else {
      return
    }
    if (targetRef.current) {
      targetRef.current.id = targetId
    } else {
      ref.current.id = targetId
    }
    const cp = new ClipboardJS(ref.current)
    init && init(cp)
    return () => cp.destroy()
  }, [...deps, id])
  return {
    button: ref,
    target: targetRef,
  }
}
