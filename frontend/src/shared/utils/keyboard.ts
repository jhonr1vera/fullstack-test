import React from 'react';

// Enfoca al siguiente campo de un form al presionar enter
export const handleEnterTransition = (
  e: React.KeyboardEvent<HTMLInputElement>,
  nextFieldId: string,
) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const nextField = document.getElementById(nextFieldId);
    if (nextField) {
      nextField.focus();
    }
  }
};
