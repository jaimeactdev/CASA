// getCustomStepConnector.tsx
import { StepConnector, stepConnectorClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

export const getCustomStepConnector = (
  stepProgressList: number[],
  isVertical: boolean
) =>
  styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 12,
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: isVertical ? '100%' : 4,
      width: isVertical ? 4 : '100%',
      border: 0,
      borderRadius: 2,
      backgroundColor: '#e0e0e0',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        backgroundColor: theme.palette.primary.main,
        left: 0,
        top: 0,
        width: isVertical ? '100%' : 'var(--progress, 0%)',
        height: isVertical ? 'var(--progress, 0%)' : '100%',
        transition: 'width 0.3s ease, height 0.3s ease',
      },
    },
  })) as typeof StepConnector;
