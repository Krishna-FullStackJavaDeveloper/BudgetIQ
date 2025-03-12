import * as React from 'react';
import { Input } from '@mui/material'; // Correct import from @mui/material
import { Box, styled } from '@mui/system';

function OTP({
  separator,
  length,
  value,
  onChange,
}: {
  separator: React.ReactNode;
  length: number;
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}) {
  const inputRefs = React.useRef<HTMLInputElement[]>(new Array(length).fill(null));

  const focusInput = (targetIndex: number) => {
    const targetInput = inputRefs.current[targetIndex];
    targetInput.focus();
  };

  const selectInput = (targetIndex: number) => {
    const targetInput = inputRefs.current[targetIndex];
    targetInput.select();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>, // Ensure the correct type is specified
    currentIndex: number,
  ) => {
    // Add type assertion to ensure the event is correctly typed
    const inputEvent = event as React.KeyboardEvent<HTMLInputElement>;
  
    switch (inputEvent.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case ' ':
        inputEvent.preventDefault();
        break;
      case 'ArrowLeft':
        inputEvent.preventDefault();
        if (currentIndex > 0) {
          focusInput(currentIndex - 1);
          selectInput(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        inputEvent.preventDefault();
        if (currentIndex < length - 1) {
          focusInput(currentIndex + 1);
          selectInput(currentIndex + 1);
        }
        break;
      case 'Delete':
        inputEvent.preventDefault();
        onChange((prevOtp) => {
          const otp =
            prevOtp.slice(0, currentIndex) + prevOtp.slice(currentIndex + 1);
          return otp;
        });
        break;
      case 'Backspace':
        inputEvent.preventDefault();
        if (currentIndex > 0) {
          focusInput(currentIndex - 1);
          selectInput(currentIndex - 1);
        }
  
        onChange((prevOtp) => {
          const otp =
            prevOtp.slice(0, currentIndex) + prevOtp.slice(currentIndex + 1);
          return otp;
        });
        break;
  
      default:
        break;
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    currentIndex: number,
  ) => {
    const currentValue = event.target.value;
    let indexToEnter = 0;

    while (indexToEnter <= currentIndex) {
      if (inputRefs.current[indexToEnter].value && indexToEnter < currentIndex) {
        indexToEnter += 1;
      } else {
        break;
      }
    }
    onChange((prev) => {
      const otpArray = prev.split('');
      const lastValue = currentValue[currentValue.length - 1];
      otpArray[indexToEnter] = lastValue;
      return otpArray.join('');
    });
    if (currentValue !== '') {
      if (currentIndex < length - 1) {
        focusInput(currentIndex + 1);
      }
    }
  };

  const handleClick = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
    currentIndex: number,
  ) => {
    selectInput(currentIndex);
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    currentIndex: number,
  ) => {
    event.preventDefault();
    const clipboardData = event.clipboardData;

    // Check if there is text data in the clipboard
    if (clipboardData.types.includes('text/plain')) {
      let pastedText = clipboardData.getData('text/plain');
      pastedText = pastedText.substring(0, length).trim();
      let indexToEnter = 0;

      while (indexToEnter <= currentIndex) {
        if (inputRefs.current[indexToEnter].value && indexToEnter < currentIndex) {
          indexToEnter += 1;
        } else {
          break;
        }
      }

      const otpArray = value.split('');

      for (let i = indexToEnter; i < length; i += 1) {
        const lastValue = pastedText[i - indexToEnter] ?? ' ';
        otpArray[i] = lastValue;
      }

      onChange(otpArray.join(''));
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    {new Array(length).fill(null).map((_, index) => (
      <React.Fragment key={index}>
        <Input
          inputRef={(ele) => {
            inputRefs.current[index] = ele!;
          }}
          aria-label={`Digit ${index + 1} of OTP`}
          onKeyDown={(event:  React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(event, index)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(event, index)}
          onClick={(event: React.MouseEvent<HTMLInputElement, MouseEvent>) => handleClick(event, index)}
          onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => handlePaste(event, index)}
          value={value[index] ?? ''}
          sx={{
            width: 50,
            height: 50,
            fontFamily: 'sans-serif',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: '400',
            padding: '8px 0',
            borderRadius: '8px',
            border: '1px solid #DAE2ED', // Border color for the OTP box
            color: '#1C2025',
            background:'#fff',
            boxShadow:'0 2px 4px rgba(0,0,0, 0.05)',
            '&:focus': {
              borderColor: '#3399FF', // Border color on focus
              boxShadow: '0 0 0 3px #80BFFF', // Focus shadow
            },
            '&:hover': {
                borderColor: '#3399FF'
            },
            ' &:focus-visible': {
                outline: '0'
            },
            '&:not(:last-child)': {
                textAlign: 'center',
                //  marginRight: '8px', // Space between OTP inputs
            },
          }}
        />
        {index === length - 1 ? null : separator}
      </React.Fragment>
    ))}
  </Box>
  );
}

export default OTP;
