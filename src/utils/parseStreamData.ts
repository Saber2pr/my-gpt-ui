export function parseStreamData(content: string) {
  // 按行分割数据
  const chunks = content.split('\n\n').filter(Boolean)
  const result: { event: string; id: string; data: any }[] = []
  // 遍历行以解析事件类型、ID和数据

  for (const chunk of chunks) {
    let event: string
    let id: string
    let data: string
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.replace('event:', '').trim()
      }

      if (line.startsWith('id:')) {
        id = line.replace('id:', '').trim()
      }

      if (line.startsWith('data:')) {
        try {
          data = JSON.parse(line.replace('data:', '').trim())
        } catch (error) {}
      }
    }

    result.push({ event, id, data })
  }

  return result
}
