import { useEffect, useId, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import styles from "./Dropdown.module.css"

type DropdownProps = {
  id: string
  value: string
  disabled?: boolean
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function Dropdown({ id, value, options, onChange, disabled = false }: DropdownProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const selectedIndex = options.findIndex((option) => option.value === value)

  useEffect(() => {
    if (!open) return

    function dismiss(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", dismiss)
    return () => document.removeEventListener("pointerdown", dismiss)
  }, [open])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  function expand(index = selectedIndex >= 0 ? selectedIndex : 0) {
    if (disabled || !options.length) return
    setActiveIndex(index)
    setOpen(true)
  }

  function select(index: number) {
    const option = options[index]
    if (option && !disabled) onChange(option.value)
    setOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || !options.length) return
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault()
        const direction = event.key === "ArrowDown" ? 1 : -1
        if (!open) expand()
        else
          setActiveIndex(
            (index) => (index + direction + options.length) % options.length,
          )
        break
      }
      case "Home":
        event.preventDefault()
        expand(0)
        break
      case "End":
        event.preventDefault()
        expand(options.length - 1)
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (open) select(activeIndex)
        else expand()
        break
      case "Escape":
        if (open) event.preventDefault()
        setOpen(false)
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onBlur={() => setOpen(false)}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : expand())}
        onKeyDown={handleKeyDown}
        className={styles.trigger}
      >
        <span>{options[selectedIndex]?.label}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className={`${styles.chevron} ${open ? styles.expanded : ""}`}
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ul
        id={listId}
        role="listbox"
        aria-labelledby={id}
        data-open={open}
        aria-hidden={!open}
        inert={!open}
        onMouseDown={(event) => event.preventDefault()}
        className={styles.list}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={option.value === value}
            onMouseMove={() => setActiveIndex(index)}
            onClick={() => select(index)}
            className={`${styles.option} ${index === activeIndex ? styles.active : ""} ${option.value === value ? styles.selected : ""}`}
          >
            {option.label}
            {option.value === value && (
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                className={styles.check}
              >
                <path
                  d="m3 8 3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
