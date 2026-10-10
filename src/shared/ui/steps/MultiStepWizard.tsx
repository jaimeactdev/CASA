// MultiStepWizard.tsx
'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Stack,
  useTheme,
} from '@mui/material';
import {
  FormProvider,
  UseFormReturn,
  FieldValues,
  useWatch,
} from 'react-hook-form';
import { ResponsiveStyleValue } from '@mui/system';
import { getCustomStepConnector } from '../mui/CustomStepConnector';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import HoverIconButton from '../mui/HoverIconButton'; 
import { AnimatedStepIcon } from './AnimatedStepIcon';


interface StepConfig {
  label: string;
  component: React.ReactNode;
  fields: string[];
}

type StepperPosition = 'top' | 'bottom' | 'left' | 'right';

interface MultiStepWizardProps<T extends FieldValues> {
  steps: StepConfig[];
  methods: UseFormReturn<T>;
  onFinish: (data: T) => void;
  stepperPosition?: StepperPosition;
  showProgress?: boolean;
}

export function MultiStepWizard<T extends FieldValues>({
  steps,
  methods,
  onFinish,
  stepperPosition = 'top',
  showProgress = true,
}: MultiStepWizardProps<T>) {
  const [activeStep, setActiveStep] = useState(0);
  const [forceTopLayout, setForceTopLayout] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  const [completedSteps, setCompletedSteps] = useState<boolean[]>(() =>
    steps.map(() => false)
  );

  const handleNext = async () => {
    const valid = await methods.trigger(currentStep.fields as any);
    if (!valid) return;

    if (isLastStep) {
      onFinish(methods.getValues());
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = async (index: number) => {
    if (index < activeStep) {
      setActiveStep(index);
    } else {
      const valid = await methods.trigger(steps[activeStep].fields as any);
      if (valid) setActiveStep(index);
    }
  };

  useEffect(() => {
    const contentHeight = contentRef.current?.offsetHeight || 0;
    if (
      (stepperPosition === 'left' || stepperPosition === 'right') &&
      contentHeight > 500
    ) {
      setForceTopLayout(true);
    } else {
      setForceTopLayout(false);
    }
  }, [activeStep, stepperPosition]);

  const finalStepperPosition =
    forceTopLayout &&
    (stepperPosition === 'left' || stepperPosition === 'right')
      ? 'top'
      : stepperPosition;

  const isVertical =
    finalStepperPosition === 'left' || finalStepperPosition === 'right';

  const layoutDirection = {
    top: 'column',
    bottom: 'column-reverse',
    left: 'row',
    right: 'row-reverse',
  }[finalStepperPosition] as ResponsiveStyleValue<
    'column' | 'column-reverse' | 'row' | 'row-reverse'
  >;

  

  // Progreso individual por paso
  /*
  const stepProgressList = steps.map((step) => {
   const rawWatched = useWatch({
  control: methods.control,
  name: step.fields as any,
});

   const watchedArray = ([] as any[]).concat(rawWatched ?? []);

    const filledCount = watchedArray.filter((v) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== '';
    }).length;

    return Math.round((filledCount / step.fields.length) * 100);
  });
 
  */

  const allFields = steps.flatMap((step) => step.fields);

const watchedArray = useWatch({
  control: methods.control,
  name: allFields as any,
});

const watchedValues = allFields.reduce<Record<string, any>>((acc, field, idx) => {
  acc[field] = watchedArray?.[idx];
  return acc;
}, {});

const stepProgressList = steps.map((step) => {
  const values = step.fields.map((field) => watchedValues?.[field]);
  const filledCount = values.filter((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && v !== '';
  }).length;
  return Math.round((filledCount / step.fields.length) * 100);
});

  useEffect(() => {

  console.log("activeStep es ", activeStep);
  const isStepCompleted = stepProgressList[activeStep] === 100;

  console.log("isStepCompleted es ", isStepCompleted);

  if (isStepCompleted && !completedSteps[activeStep]) {
    setCompletedSteps((prev) => {
      const newArr = [...prev];
      newArr[activeStep] = true;
      return newArr;
    });
  }
}, [stepProgressList, activeStep, completedSteps]);

  const CustomConnector = useMemo(
    () => getCustomStepConnector(stepProgressList,isVertical ),
    [stepProgressList, isVertical]
  );

  return (
    <Box width="100%" bgcolor="#fff" p={4} borderRadius={2} boxShadow={1}>
      <FormProvider {...methods}>
        <Stack
          direction={layoutDirection}
          spacing={4}
          alignItems={isVertical ? 'flex-start' : 'stretch'}
        >
          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isVertical}
            orientation={isVertical ? 'vertical' : 'horizontal'}
            connector={ showProgress ? <CustomConnector /> : undefined}
            sx={{
              ...(isVertical && {
                minWidth: 180,
                alignSelf: 'flex-start',
                position: 'sticky',
                top: 20,
              }),
            }}
          >
            {steps.map((step, index) => (
              <Step
                key={index}
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor: 'pointer',
                  ...(index > 0 && {
                    [`& .MuiStepConnector-line`]: {
                      '--progress': `${stepProgressList[index - 1]}%`,
                    },
                  }),
                }}
              >
               
                 <StepLabel StepIconComponent={(props) => (
  <AnimatedStepIcon {...props} completed={completedSteps[index]} />
)}>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box flex={1}>
            <Box ref={contentRef} mb={4}>
              {currentStep.component}
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={theme.customButtons.secondary}
              >
                Atrás
              </Button>
          <HoverIconButton
                text={isLastStep ? 'Finalizar' : 'Siguiente'}
                icon={<ArrowRightAltIcon fontSize="large" />}
                iconPosition="center"
                onClick={handleNext} // 👈 Aquí pasas tu función normalmente
                sx={theme.customButtons.primary}
              />
            </Box>
          </Box>
        </Stack>
      </FormProvider>
    </Box>
  );
}
