import React from 'react'
import { pageProps } from '../../interfaces/pageprops'

export default function InfoBlock({crumb, url}: pageProps ) {
  return (
    <>
        <a href={url}>{ crumb }</a>
    </>
  )
}