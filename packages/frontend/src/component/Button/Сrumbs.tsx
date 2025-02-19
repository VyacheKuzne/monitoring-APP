import React from 'react'
import { pageProps } from '../../interfaces/pageprops'

export default function InfoBlock({url, crumb}: pageProps ) {
  return (
    <>
      {url ? <a className='font-montserrat text10-20px' href={`${url}`}>{ crumb }</a>
      : <p className='font-montserrat text10-20px'>{ crumb }</p>}
    </>
  )
}