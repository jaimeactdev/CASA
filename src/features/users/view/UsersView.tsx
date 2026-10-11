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
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes } from '@/styles/designTokens';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import InputFieldMUI from '@/shared/ui/mui/InputFieldMUI';
import PasswordFieldMUI from '@/shared/ui/mui/PasswordFieldMUI';
import SelectFieldMUI from '@/shared/ui/mui/SelectFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import AppDialog from '@/shared/ui/Modal/AppDialog';
import DatatableLocal from '@/shared/ui/primereact/Datatable/DatatableLocal';
import { renderEstadoDisplayValue } from '@/shared/ui/StatusIndicatorCell';
import { useUsersViewModel } from '../viewmodel/useUsersViewModel';
import type { UserRecord } from '../domain/usersTypes';

export default function UsersView() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState<UserRecord[]>([]);
  const vm = useUsersViewModel();

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
        Usuarios
      </Typography>
      <Typography
        sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}
      >
        Personal que entra a la aplicación. La clave inicial no se vuelve a
        mostrar. Un usuario inactivo no entra y no se borra.
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
            Personal
          </Typography>
          {vm.canManage ? (
            <HoverIconButton
              text="Nuevo usuario"
              type="button"
              onClick={vm.openCreate}
              sx={theme.customButtons.secondary}
            />
          ) : (
            <Typography sx={{ color: colors.textSecondary }}>
              Tu rol solo permite ver los usuarios.
            </Typography>
          )}
        </Box>

        <DatatableLocal
          isMobile={isMobile}
          data={vm.users}
          rows={20}
          columns={[
            { field: 'name', header: 'Nombre', minWidth: 180, filter: true, sortable: true },
            { field: 'email', header: 'Correo', minWidth: 200, filter: true, sortable: true },
            { field: 'roleName', header: 'Rol', minWidth: 160, filter: true, sortable: true },
            {
              field: 'estadoDisplay',
              header: 'Estado',
              minWidth: 120,
              filter: true,
              body: (row: UserRecord) =>
                renderEstadoDisplayValue(row.estadoDisplay),
            },
          ]}
          expandedRows={expandedRows}
          onRowToggle={(event) => setExpandedRows(event.data)}
          showExportExcel={false}
          showEditButton={vm.canManage}
          onEditButtonClick={vm.openEdit}
          showActivateButton={
            vm.canManage
              ? (row: UserRecord) => row.estado === 'I'
              : false
          }
          onActivateButtonClick={vm.activateUser}
          showInactivateButton={
            vm.canManage
              ? (row: UserRecord) =>
                  row.estado === 'A' && row.id !== vm.currentUserId
              : false
          }
          onInactivateButtonClick={vm.inactivateUser}
          tipoViewAcciones="Menu"
          renderExtraMenuItems={
            vm.canManage
              ? (row: UserRecord) => (
                  <MenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      window.setTimeout(() => vm.openResetPassword(row), 0);
                    }}
                  >
                    <ListItemIcon>
                      <VpnKeyOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Asignar clave nueva
                  </MenuItem>
                )
              : undefined
          }
        />
      </Paper>

      <AppDialog open={vm.formOpen} onClose={vm.closeForm} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={vm.saveForm} noValidate>
          <DialogTitle>
            {vm.editing ? 'Editar usuario' : 'Nuevo usuario'}
          </DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}
          >
            <InputFieldMUI
              name="userName"
              label="Nombre"
              value={vm.values.name}
              onChange={vm.onChangeName}
              error={vm.errors.name}
              maxlenght={120}
            />
            <InputFieldMUI
              name="userEmail"
              label="Correo"
              value={vm.values.email}
              onChange={vm.onChangeEmail}
              error={vm.errors.email}
              keyfilter="email"
              maxlenght={160}
            />
            <SelectFieldMUI
              name="userRole"
              label="Rol"
              value={vm.values.roleId}
              onChange={vm.onChangeRole}
              options={vm.roleOptions}
              error={vm.errors.roleId}
              disabled={vm.roleLocked}
            />
            {vm.roleLocked ? (
              <Typography sx={{ color: colors.textSecondary, mt: -1 }}>
                No puedes quitarte el rol Administrador.
              </Typography>
            ) : null}
            {vm.editing ? null : (
              <>
                <PasswordFieldMUI
                  name="userPassword"
                  label="Clave inicial"
                  value={vm.values.password}
                  onChange={vm.onChangePassword}
                  error={vm.errors.password}
                  maxlenght={72}
                  smallText="Mínimo 8 caracteres. Deberá cambiarla al entrar."
                />
                <PasswordFieldMUI
                  name="userPasswordConfirm"
                  label="Confirmar clave"
                  value={vm.values.confirmPassword}
                  onChange={vm.onChangeConfirmPassword}
                  error={vm.errors.confirmPassword}
                  maxlenght={72}
                />
              </>
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
            <HoverIconButton
              text="Guardar"
              type="submit"
              disabled={vm.isSaving}
              sx={theme.customButtons.primary}
            />
          </DialogActions>
        </Box>
      </AppDialog>

      <AppDialog
        open={Boolean(vm.passwordUser)}
        onClose={vm.closeResetPassword}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={vm.savePassword} noValidate>
          <DialogTitle>Asignar clave nueva</DialogTitle>
          <DialogContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}
          >
            <Typography sx={{ color: colors.textSecondary }}>
              {vm.passwordUser
                ? `Para ${vm.passwordUser.name}. La clave no se vuelve a mostrar y deberá cambiarla al entrar.`
                : ''}
            </Typography>
            <PasswordFieldMUI
              name="resetPassword"
              label="Clave nueva"
              value={vm.passwordValues.password}
              onChange={vm.onChangeResetPassword}
              error={vm.passwordErrors.password}
              maxlenght={72}
            />
            <PasswordFieldMUI
              name="resetPasswordConfirm"
              label="Confirmar clave"
              value={vm.passwordValues.confirmPassword}
              onChange={vm.onChangeResetConfirm}
              error={vm.passwordErrors.confirmPassword}
              maxlenght={72}
            />
            {vm.passwordError ? (
              <Typography sx={{ color: colors.error }}>
                {vm.passwordError}
              </Typography>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <HoverIconButton
              text="Cancelar"
              type="button"
              onClick={vm.closeResetPassword}
              sx={theme.customButtons.secondary}
            />
            <HoverIconButton
              text="Asignar clave"
              type="submit"
              disabled={vm.isSavingPassword}
              sx={theme.customButtons.primary}
            />
          </DialogActions>
        </Box>
      </AppDialog>
    </Box>
  );
}
