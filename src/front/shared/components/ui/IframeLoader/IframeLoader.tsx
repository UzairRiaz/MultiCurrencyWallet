import React, { useState } from 'react'

function IframeLoader({ src, width, height }) {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      <iframe
        src={src}
        width={width}
        height={height}
        onLoad={handleLoad}
        frameBorder="0"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  )
}

export default IframeLoader
