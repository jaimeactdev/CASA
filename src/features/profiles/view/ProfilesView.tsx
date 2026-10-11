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
import CheckboxGroupFieldMUI from '@/shared/ui/mui/CheckboxGroupFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import DatatableLocal from '@/shared/ui/primereact/Datatable/DatatableLocal';
import { renderEstadoDisplayValue } from '@/shared/ui/StatusIndicatorCell';
import { useProfilesViewModel } from '../viewmodel/useProfilesViewModel';
import type { ProfileRecord } from '../domain/profilesTypes';

export default function ProfilesView() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState<ProfileRecord[]>([]);
  const vm = useProfilesViewModel();
  const readOnly = Boolean(vm.editing) && !vm.canManage;

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{ fontSize: fontSizes.xl, fontWeight: 600, color: colors.textPrincipal }}
      >
        Perfiles
      </Typography>
      <Typography sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}>
        Cada perfil de afiliación tiene su porcentaje sobre el SMMLV. La cuota
        de la lista es la plena con el salario vigente.
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
            Perfiles de afiliación
          </Typography>
          {vm.canManage ? (
            <HoverIconButton
              text="Nuevo perfil"
              type="button"
              onClick={vm.openCreate}
              sx={theme.customButtons.secondary}
            />
          ) : (
            <Typography sx={{ color: colors.textSecondary }}>
              Tu rol solo permite ver los perfiles.
            </Typography>
          )}
        </Box>

        <DatatableLocal
          isMobile={isMobile}
          data={vm.profiles}
          rows={20}
          columns={[
            { field: 'name', header: 'Nombre', minWidth: 160, filter: true, sortable: true },
            { field: 'percentLabel', header: 'Porcentaje', minWidth: 120, filter: true },
            { field: 'fullFeeLabel', header: 'Cuota resultante', minWidth: 160 },
            {
              field: 'benefitSummary',
              header: 'Beneficios',
              minWidth: 220,
              maxLength: 80,
            },
            {
              field: 'estadoDisplay',
              header: 'Estado',
              minWidth: 120,
              filter: true,
              body: (row: ProfileRecord) => renderEstadoDisplayValue(row.estadoDisplay),
            },
          ]}
          expandedRows={expandedRows}
          onRowToggle={(event) => setExpandedRows(event.data)}
          showExportExcel={false}
          showEditButton={vm.canManage}
          onEditButtonClick={vm.openEdit}
          showActivateButton={
            vm.canManage ? (row: ProfileRecord) => row.estado === 'I' : false
          }
          onActivateButtonClick={vm.activateProfile}
          showInactivateButton={
            vm.canManage ? (row: ProfileRecord) => row.estado === 'A' : false
          }
          onInactivateButtonClick={vm.inactivateProfile}
          tipoViewAcciones="Menu"
          renderExtraMenuItems={
            vm.canManage
              ? undefined
              : (row: ProfileRecord) => (
                  <MenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      window.setTimeout(() => vm.openEdit(row), 0);
                    }}
                  >
                    <ListItemIcon>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Ver perfil
                  </MenuItem>
                )
          }
        />
      </Paper>

      <AppDialog open={vm.formOpen} onClose={vm.closeForm} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={vm.saveForm} noValidate>
          <DialogTitle>
            {vm.editing ? (vm.canManage ? 'Editar perfil' : 'Perfil') : 'Nuevo perfil'}
          </DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1, maxHeight: '70vh' }}
          >
            <InputFieldMUI
              name="profileName"
              label="Nombre"
              value={vm.values.name}
              onChange={vm.onChangeName}
              error={vm.errors.name}
              disabled={readOnly}
              maxlenght={80}
            />
            <InputFieldMUI
              name="profilePercent"
              label="Porcentaje del SMMLV"
              value={vm.values.percent}
              onChange={vm.onChangePercent}
              error={vm.errors.percent}
              disabled={readOnly}
              keyfilter="money"
              maxlenght={6}
              smallText="1,70 significa 1,70 % del salario mínimo. Mayor que 0 y máximo 100."
            />
            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: colors.brandTint }}>
              <Typography sx={{ fontWeight: 600, color: colors.textPrincipal, mb: 0.5 }}>
                Cuota plena con el SMMLV actual
              </Typography>
              {vm.wageIsZero ? (
                <Typography sx={{ color: colors.textSecondary }}>
                  Con el SMMLV en 0 no se puede afiliar ni generar cuotas.
                </Typography>
              ) : (
                <Typography sx={{ color: colors.textPrincipal }}>
                  {vm.previewLabel || 'Escribe un porcentaje para ver la cuota.'}
                </Typography>
              )}
            </Box>
            <Typography sx={{ fontWeight: 600, color: colors.textPrincipal }}>
              Beneficios incluidos
            </Typography>
            {vm.benefits.length === 0 ? (
              <Typography sx={{ color: colors.textSecondary }}>
                No hay beneficios en el catálogo.
              </Typography>
            ) : (
              <CheckboxGroupFieldMUI
                name="profileBenefits"
                direction="column"
                value={vm.values.benefitIds}
                options={vm.benefits.map((benefit) => ({
                  value: benefit.id,
                  label: benefit.isActive ? benefit.name : `${benefit.name} (inactivo)`,
                }))}
                onChange={vm.onChangeBenefits}
                disabled={readOnly}
              />
            )}
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
