import React from 'react'

interface SwitchProps {
  checked: boolean
  onChange: () => void
  className?: string
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, className }) => {
  return (
    <label className={`switch ${className}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  )
}

// Add basic styles for the switch
const style = document.createElement('style')
style.innerHTML = `
  .switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 20px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #2196F3;
  }

  input:checked + .slider:before {
    transform: translateX(14px);
  }
`
document.head.appendChild(style)
