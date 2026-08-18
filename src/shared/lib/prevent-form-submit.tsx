export const preventFormSubmit = (
  e: React.KeyboardEvent<HTMLFormElement>,
): void => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
};
