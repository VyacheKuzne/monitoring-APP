import React from 'react';

interface LinkButtonProps {
    linkText?: string; // Optional Prop
}
function LinkButton({linkText}:LinkButtonProps) {
    
    return(
        <>
        <button className='text12-24px'>
            <p>{linkText}</p>
        </button>
        </>
    )
}

export default LinkButton