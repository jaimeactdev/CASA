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
import CheckboxGroupFieldMUI from '@/shared/ui/mui/CheckboxGroupFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import DatatableLocal from '@/shared/ui/primereact/Datatable/DatatableLocal';
import { renderEstadoDisplayValue } from '@/shared/ui/StatusIndicatorCell';
import { useRolesViewModel } from '../viewmodel/useRolesViewModel';
import type { RoleRecord } from '../domain/rolesTypes';

export default function RolesView() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState<RoleRecord[]>([]);
  const vm = useRolesViewModel();

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{
          fontSize: fontSizes.xl,
          fontWeight: 600,
          color: colors.textPrincipal,
        }}
      >
        Roles
      </Typography>
      <Typography
        sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}
      >
        Cada rol agrupa permisos. Administrador y Operativo son de sistema: se
        les pueden ajustar los permisos, pero no se desactivan ni se borran.
      </Typography>

      {vm.loadError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>{vm.loadError}</Typography>
      ) : null}
      {vm.actionError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>
          {vm.actionError}
        </Typography>
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
            Roles del personal
          </Typography>
          {vm.canManage ? (
            <HoverIconButton
              text="Nuevo rol"
              type="button"
              onClick={vm.openCreate}
              sx={theme.customButtons.secondary}
            />
          ) : (
            <Typography sx={{ color: colors.textSecondary }}>
              Tu rol solo permite ver los roles.
            </Typography>
          )}
        </Box>

        <DatatableLocal
          isMobile={isMobile}
          data={vm.roles}
          rows={20}
          columns={[
            { field: 'name', header: 'Nombre', minWidth: 180, filter: true, sortable: true },
            {
              field: 'description',
              header: 'Descripción',
              minWidth: 220,
              maxLength: 80,
            },
            {
              field: 'systemDisplay',
              header: 'Tipo',
              minWidth: 140,
              filter: true,
            },
            {
              field: 'estadoDisplay',
              header: 'Estado',
              minWidth: 120,
              filter: true,
              body: (row: RoleRecord) =>
                renderEstadoDisplayValue(row.estadoDisplay),
            },
          ]}
          expandedRows={expandedRows}
          onRowToggle={(event) => setExpandedRows(event.data)}
          showExportExcel={false}
          showEditButton={vm.canManage}
          onEditButtonClick={vm.openEdit}
          renderExtraMenuItems={
            vm.canManage
              ? undefined
              : (row: RoleRecord) => (
                  <MenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      window.setTimeout(() => vm.openEdit(row), 0);
                    }}
                  >
                    <ListItemIcon>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Ver permisos
                  </MenuItem>
                )
          }
          showActivateButton={
            vm.canManage ? (row: RoleRecord) => row.estado === 'I' : false
          }
          onActivateButtonClick={vm.activateRole}
          showInactivateButton={
            vm.canManage
              ? (row: RoleRecord) => row.estado === 'A' && !row.isSystem
              : false
          }
          onInactivateButtonClick={vm.inactivateRole}
          tipoViewAcciones="Menu"
        />
      </Paper>

      <AppDialog open={vm.formOpen} onClose={vm.closeForm} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={vm.saveForm} noValidate>
          <DialogTitle>
            {vm.editing
              ? vm.canManage
                ? 'Editar rol'
                : 'Permisos del rol'
              : 'Nuevo rol'}
          </DialogTitle>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              pt: 1,
              maxHeight: '70vh',
            }}
          >
            <InputFieldMUI
              name="roleName"
              label="Nombre"
              value={vm.values.name}
              onChange={vm.onChangeName}
              error={vm.errors.name}
              disabled={vm.nameLocked || !vm.canManage}
              maxlenght={80}
              smallText={
                vm.nameLocked
                  ? 'El nombre de un rol de sistema no se cambia.'
                  : undefined
              }
            />
            <TextAreaFieldMUI
              name="roleDescription"
              label="Descripción"
              value={vm.values.description}
              onChange={vm.onChangeDescription}
              error={vm.errors.description}
              disabled={!vm.canManage}
              maxlenght={400}
              rows={3}
            />
            <Typography sx={{ fontWeight: 600, color: colors.textPrincipal }}>
              Permisos
            </Typography>
            {vm.permissionGroups.length === 0 ? (
              <Typography sx={{ color: colors.textSecondary }}>
                No hay permisos en el catálogo.
              </Typography>
            ) : (
              vm.permissionGroups.map((group) => (
                <CheckboxGroupFieldMUI
                  key={group.module}
                  name={`permissions-${group.module}`}
                  label={group.label}
                  direction="column"
                  value={vm.values.permissionIds.filter((id) =>
                    group.items.some((item) => item.id === id),
                  )}
                  options={group.items.map((item) => ({
                    value: item.id,
                    label: item.label,
                  }))}
                  onChange={(next) =>
                    vm.setModulePermissions(
                      group.items.map((item) => item.id),
                      next,
                    )
                  }
                  disabled={!vm.canManage}
                />
              ))
            )}
            {vm.formError ? (
              <Typography sx={{ color: colors.error }}>{vm.formError}</Typography>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <HoverIconButton
              text="Cancelar"
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
