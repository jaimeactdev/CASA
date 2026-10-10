'use client';

import { Box, Button, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InputFieldMUI from '@/shared/ui/mui/InputFieldMUI';
import DateFieldMUI from '@/shared/ui/mui/DateFieldMUI';
import SelectFieldMUI from '@/shared/ui/mui/SelectFieldMUI';
import SelectWithSearchFieldMUI from '@/shared/ui/mui/SelectWithSearchFieldMUI';
import MultiSelectFieldMUI from '@/shared/ui/mui/MultiSelectFieldMUI';
import TextAreaFieldMUI from '@/shared/ui/mui/TextAreaFieldMUI';
import CheckboxFieldMUI from '@/shared/ui/mui/CheckboxFieldMUI';
import RadioButtonFieldMUI from '@/shared/ui/mui/RadioButtonFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import { useFormViewModel } from '../viewmodel/useFormViewModel';

export function FormView() {
  const theme = useTheme();
  const {
    values,
    errors,
    catalogs,
    onChangeFullName,
    onChangeDocumentId,
    onChangeDate,
    onChangeType,
    onChangeCity,
    onChangeInterests,
    onChangePriority,
    onChangeNotes,
    onChangeAcceptsTerms,
    onSubmit,
    onReset,
  } = useFormViewModel();

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Formulario de ejemplo
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 640 }}
      >
        Pantalla de referencia del kit compartido: campos de{' '}
        <code>src/shared/ui/mui</code> y botones píldora de{' '}
        <code>theme.customButtons</code>.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '16px',
        }}
      >
        <Box
          component="form"
          onSubmit={onSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            rowGap: 3,
          }}
        >
          <Box sx={theme.customStyleForm.grid6md}>
            <InputFieldMUI
              name="fullName"
              label="Nombre"
              value={values.fullName}
              onChange={onChangeFullName}
              error={errors.fullName}
              keyfilter="alpha-es"
              maxlenght={80}
            />
          </Box>

          <Box sx={theme.customStyleForm.grid6md}>
            <InputFieldMUI
              name="documentId"
              label="Documento"
              value={values.documentId}
              onChange={onChangeDocumentId}
              error={errors.documentId}
              keyfilter="pint"
              maxlenght={20}
            />
          </Box>

          <Box sx={theme.customStyleForm.grid6md}>
            <DateFieldMUI
              name="date"
              label="Fecha"
              value={values.date}
              onChange={onChangeDate}
              error={errors.date}
            />
          </Box>

          <Box sx={theme.customStyleForm.grid6md}>
            <SelectFieldMUI
              name="type"
              label="Tipo"
              value={values.type}
              onChange={onChangeType}
              options={catalogs.types}
              error={errors.type}
            />
          </Box>

          <Box sx={theme.customStyleForm.grid6md}>
            <SelectWithSearchFieldMUI
              name="city"
              label="Ciudad"
              value={values.city}
              onChange={onChangeCity}
              options={catalogs.cities}
              error={errors.city}
            />
          </Box>

          <Box sx={theme.customStyleForm.grid6md}>
            <MultiSelectFieldMUI
              name="interests"
              label="Intereses"
              value={values.interests}
              onChange={onChangeInterests}
              options={catalogs.interests}
              error={errors.interests}
            />
          </Box>

          <Box sx={theme.customStyleForm.grid12md}>
            <RadioButtonFieldMUI
              name="priority"
              label="Prioridad"
              value={values.priority}
              direction="row"
              options={catalogs.priorities}
              onChange={onChangePriority}
              error={errors.priority}
            />
          </Box>

          <Box sx={theme.customStyleForm.grid12md}>
            <TextAreaFieldMUI
              name="notes"
              label="Observaciones"
              value={values.notes}
              onChange={onChangeNotes}
              error={errors.notes}
              maxlenght={500}
              rows={4}
            />
          </Box>

          <Box sx={theme.customStyleForm.grid12md}>
            <CheckboxFieldMUI
              name="acceptsTerms"
              checked={values.acceptsTerms}
              onChange={onChangeAcceptsTerms}
              error={errors.acceptsTerms}
              label="Acepto el tratamiento de datos de esta plantilla."
            />
          </Box>

          <Box
            sx={{
              ...theme.customStyleForm.grid12md,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <HoverIconButton
              text="Enviar"
              type="submit"
              width={160}
              sx={theme.customButtons.primary}
            />
            <Button
              type="button"
              onClick={onReset}
              sx={theme.customButtons.secondary}
            >
              Limpiar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
