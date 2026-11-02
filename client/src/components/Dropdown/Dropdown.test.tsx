import { fireEvent, render, screen } from "@testing-library/react";
import { Dropdown } from "./Dropdown";

const options = [
  { value: "30", label: "30 seconds" },
  { value: "60", label: "60 seconds" },
];

it("supports keyboard navigation and commits only on selection", () => {
  const onChange = jest.fn();
  render(<><label htmlFor="duration">Duration</label><Dropdown id="duration" value="30" options={options} onChange={onChange} /></>);
  const trigger = screen.getByRole("combobox", { name: "Duration" });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  fireEvent.keyDown(trigger, { key: "End" });
  expect(onChange).not.toHaveBeenCalled();
  expect(trigger).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "60 seconds" }).id);
  fireEvent.keyDown(trigger, { key: "Enter" });
  expect(onChange).toHaveBeenCalledWith("60");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});

it("dismisses on Escape, Tab, outside pointer presses, and disabling", () => {
  const props = { id: "duration", value: "30", options, onChange: jest.fn() };
  const { rerender } = render(<Dropdown {...props} />);
  const trigger = screen.getByRole("combobox");
  for (const key of ["Escape", "Tab"]) {
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(trigger);
  rerender(<Dropdown {...props} disabled />);
  expect(trigger).toBeDisabled();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(props.onChange).not.toHaveBeenCalled();
});
