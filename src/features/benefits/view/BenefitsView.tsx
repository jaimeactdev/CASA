'use client';

import { useState } from 'react';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes } from '@/styles/designTokens';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import InputFieldMUI from '@/shared/ui/mui/InputFieldMUI';
import TextAreaFieldMUI from '@/shared/ui/mui/TextAreaFieldMUI';
import SelectFieldMUI from '@/shared/ui/mui/SelectFieldMUI';
import CheckboxFieldMUI from '@/shared/ui/mui/CheckboxFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import DatatableLocal from '@/shared/ui/primereact/Datatable/DatatableLocal';
import { renderEstadoDisplayValue } from '@/shared/ui/StatusIndicatorCell';
import { useBenefitsViewModel } from '../viewmodel/useBenefitsViewModel';
import {
  AUDIENCE_OPTIONS,
  BENEFIT_TYPE_OPTIONS,
  MONTH_OPTIONS,
  type AudienceCode,
  type BenefitRecord,
  type BenefitTypeCode,
} from '../domain/benefitsTypes';

export default function BenefitsView() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState<BenefitRecord[]>([]);
  const vm = useBenefitsViewModel();
  const readOnly = Boolean(vm.editing) && !vm.canManage;
  const fieldHalf = { ...theme.customStyleForm.grid6md, display: 'block' };

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{ fontSize: fontSizes.xl, fontWeight: 600, color: colors.textPrincipal }}
      >
        Beneficios
      </Typography>
      <Typography sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}>
        Catálogo de lo que la asociación puede entregar. Quién ya lo recibió se
        consulta en entregas.
      </Typography>

      {vm.loadError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>{vm.loadError}</Typography>
      ) : null}
      {vm.actionError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>{vm.actionError}</Typography>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '16px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontWeight: 600, color: colors.textPrincipal }}>
            Catálogo
          </Typography>
          {vm.canManage ? (
            <HoverIconButton
              text="Nuevo beneficio"
              type="button"
              onClick={vm.openCreate}
              sx={theme.customButtons.secondary}
            />
          ) : (
            <Typography sx={{ color: colors.textSecondary }}>
              Tu rol solo permite ver el catálogo.
            </Typography>
          )}
        </Box>

        <DatatableLocal
          isMobile={isMobile}
          data={vm.benefits}
          rows={20}
          columns={[
            { field: 'name', header: 'Nombre', minWidth: 180, filter: true, sortable: true },
            { field: 'typeDisplay', header: 'Tipo', minWidth: 110, filter: true },
            { field: 'audienceDisplay', header: 'Público', minWidth: 120, filter: true },
            { field: 'minPaidFeesInYear', header: 'Mínimo de cuotas', minWidth: 140 },
            { field: 'maxDeliveriesPerYear', header: 'Máximo al año', minWidth: 130 },
            { field: 'publicDisplay', header: 'Página pública', minWidth: 140, filter: true },
            {
              field: 'estadoDisplay',
              header: 'Estado',
              minWidth: 120,
              filter: true,
              body: (row: BenefitRecord) => renderEstadoDisplayValue(row.estadoDisplay),
            },
          ]}
          expandedRows={expandedRows}
          onRowToggle={(event) => setExpandedRows(event.data)}
          showExportExcel={false}
          showEditButton={vm.canManage}
          onEditButtonClick={vm.openEdit}
          showActivateButton={
            vm.canManage ? (row: BenefitRecord) => row.estado === 'I' : false
          }
          onActivateButtonClick={vm.activateBenefit}
          showInactivateButton={
            vm.canManage ? (row: BenefitRecord) => row.estado === 'A' : false
          }
          onInactivateButtonClick={vm.inactivateBenefit}
          tipoViewAcciones="Menu"
          renderExtraMenuItems={
            vm.canManage
              ? undefined
              : (row: BenefitRecord) => (
                  <MenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      window.setTimeout(() => vm.openEdit(row), 0);
                    }}
                  >
                    <ListItemIcon>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Ver beneficio
                  </MenuItem>
                )
          }
        />
      </Paper>

      <AppDialog open={vm.formOpen} onClose={vm.closeForm} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={vm.saveForm} noValidate>
          <DialogTitle>
            {vm.editing
              ? vm.canManage
                ? 'Editar beneficio'
                : 'Beneficio'
              : 'Nuevo beneficio'}
          </DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1, maxHeight: '70vh' }}
          >
            <InputFieldMUI
              name="benefitName"
              label="Nombre"
              value={vm.values.name}
              onChange={vm.onChangeName}
              error={vm.errors.name}
              disabled={readOnly}
              maxlenght={120}
            />
            <TextAreaFieldMUI
              name="benefitInternal"
              label="Descripción interna"
              value={vm.values.internalDescription}
              onChange={vm.onChangeDescription}
              error={vm.errors.internalDescription}
              disabled={readOnly}
              maxlenght={500}
              rows={3}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3 }}>
              <Box sx={fieldHalf}>
                <SelectFieldMUI
                  name="benefitType"
                  label="Tipo"
                  value={vm.values.type}
                  onChange={(value) => vm.onChangeType(value as BenefitTypeCode)}
                  options={[...BENEFIT_TYPE_OPTIONS]}
                  error={vm.errors.type}
                  disabled={readOnly}
                />
              </Box>
              <Box sx={fieldHalf}>
                <SelectFieldMUI
                  name="benefitAudience"
                  label="Público objetivo"
                  value={vm.values.audience}
                  onChange={(value) => vm.onChangeAudience(value as AudienceCode)}
                  options={[...AUDIENCE_OPTIONS]}
                  error={vm.errors.audience}
                  disabled={readOnly}
                />
              </Box>
              <Box sx={fieldHalf}>
                <InputFieldMUI
                  name="benefitMin"
                  label="Mínimo de cuotas pagadas en el año"
                  value={vm.values.minPaidFeesInYear}
                  onChange={vm.onChangeMin}
                  error={vm.errors.minPaidFeesInYear}
                  disabled={readOnly}
                  keyfilter="pint"
                  maxlenght={2}
                />
              </Box>
              <Box sx={fieldHalf}>
                <InputFieldMUI
                  name="benefitMax"
                  label="Máximo de entregas al año"
                  value={vm.annualLocked ? '1' : vm.values.maxDeliveriesPerYear}
                  onChange={vm.onChangeMax}
                  error={vm.errors.maxDeliveriesPerYear}
                  disabled={readOnly || vm.annualLocked}
                  keyfilter="pint"
                  maxlenght={2}
                  smallText={
                    vm.annualLocked
                      ? 'Un beneficio anual permite una entrega.'
                      : 'De 1 a 12.'
                  }
                />
              </Box>
              <Box sx={fieldHalf}>
                <SelectFieldMUI
                  name="benefitMonth"
                  label="Mes sugerido"
                  value={vm.values.suggestedMonth}
                  onChange={vm.onChangeMonth}
                  options={MONTH_OPTIONS}
                  error={vm.errors.suggestedMonth}
                  disabled={readOnly}
                />
              </Box>
            </Box>
            <CheckboxFieldMUI
              name="benefitPublic"
              label="Visible en la página pública"
              checked={vm.values.isPublic}
              onChange={vm.onChangePublic}
              disabled={readOnly}
            />
            <TextAreaFieldMUI
              name="benefitPublicText"
              label="Texto público"
              value={vm.values.publicText}
              onChange={vm.onChangePublicText}
              error={vm.errors.publicText}
              disabled={readOnly}
              maxlenght={500}
              rows={3}
              smallText="Obligatorio si el beneficio se muestra en la página pública."
            />
            <CheckboxFieldMUI
              name="benefitRequiresMinimum"
              label="Exige configurar el mínimo antes de entregar"
              checked={vm.values.requiresMinimumSetup}
              onChange={vm.onChangeRequiresMinimum}
              disabled={readOnly}
            />
            <Typography sx={{ color: colors.textSecondary, mt: -1 }}>
              Si está marcado y el mínimo sigue en 0, la entrega normal se bloquea.
            </Typography>
            {vm.formError ? (
              <Typography sx={{ color: colors.error }}>{vm.formError}</Typography>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <HoverIconButton
              text={vm.canManage ? 'Cancelar' : 'Cerrar'}
              type="button"
              onClick={vm.closeForm}
              sx={theme.customButtons.secondary}
            />
            {vm.canManage ? (
              <HoverIconButton
                text="Guardar"
                type="submit"
                disabled={vm.isSaving}
                sx={theme.customButtons.primary}
              />
            ) : null}
          </DialogActions>
        </Box>
      </AppDialog>
    </Box>
  );
}
