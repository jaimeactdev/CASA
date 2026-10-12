'use client';

import { useState } from 'react';
import {
  Box,
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
import SelectFieldMUI from '@/shared/ui/mui/SelectFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import DatatableLocal from '@/shared/ui/primereact/Datatable/DatatableLocal';
import { StatusIndicator } from '@/shared/ui/StatusIndicatorCell';
import { useMembersViewModel } from '../viewmodel/useMembersViewModel';
import {
  SEX_OPTIONS,
  STATUS_OPTIONS,
  type MemberRecord,
} from '../domain/membersTypes';
import MemberFormDialog from './MemberFormDialog';
import MemberDetailDrawer from './MemberDetailDrawer';
import DeliverBenefitDialog from './DeliverBenefitDialog';

function renderStatus(label: string) {
  if (label === 'Activo' || label === 'No') {
    return <StatusIndicator label={label} positive />;
  }
  if (label === 'Retirado' || label === 'Sí') {
    return <StatusIndicator label={label} positive={false} />;
  }
  return <StatusIndicator label={label} positive={null} />;
}

export default function MembersView() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState<MemberRecord[]>([]);
  const vm = useMembersViewModel();
  const fieldQuarter = { ...theme.customStyleForm.grid3md, display: 'block' };
  const fieldHalf = { ...theme.customStyleForm.grid6md, display: 'block' };

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{ fontSize: fontSizes.xl, fontWeight: 600, color: colors.textPrincipal }}
      >
        Afiliados
      </Typography>
      <Typography sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}>
        Registro por ventanilla. El número de afiliación lo asigna el sistema.
        No se borra a nadie: se suspende o se retira.
      </Typography>

      {vm.loadError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>{vm.loadError}</Typography>
      ) : null}

      {vm.wageIsZero ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: '16px',
            bgcolor: colors.warningBg,
            color: colors.warningText,
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>
            Falta configurar el SMMLV vigente.
          </Typography>
          <Typography sx={{ fontSize: fontSizes.sm }}>
            No se puede afiliar ni generar cuotas mientras el salario mínimo esté en 0.
          </Typography>
        </Paper>
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
            Directorio
          </Typography>
          {vm.canCreate && !vm.wageIsZero ? (
            <HoverIconButton
              text="Nuevo afiliado"
              type="button"
              onClick={vm.openCreate}
              sx={theme.customButtons.secondary}
            />
          ) : vm.canCreate && vm.wageIsZero ? (
            <Typography sx={{ color: colors.textSecondary }}>
              El alta está bloqueada hasta configurar el SMMLV.
            </Typography>
          ) : (
            <Typography sx={{ color: colors.textSecondary }}>
              Tu rol solo permite ver los afiliados.
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3, mb: 2 }}>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="memberSearch"
              label="Buscar"
              value={vm.search}
              onChange={(event) => vm.setSearch(event.target.value)}
              smallText="Nombre, apellido, documento o número."
            />
          </Box>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="filterStatus"
              label="Estado"
              value={vm.filterStatus}
              onChange={vm.setFilterStatus}
              options={[{ value: '', label: 'Todos' }, ...STATUS_OPTIONS]}
            />
          </Box>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="filterProfile"
              label="Perfil"
              value={vm.filterProfileId}
              onChange={vm.setFilterProfileId}
              options={[
                { value: '', label: 'Todos' },
                ...vm.profiles.map((profile) => ({
                  value: profile.id,
                  label: profile.name,
                })),
              ]}
            />
          </Box>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="filterSex"
              label="Sexo"
              value={vm.filterSex}
              onChange={vm.setFilterSex}
              options={[{ value: '', label: 'Todos' }, ...SEX_OPTIONS]}
            />
          </Box>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="filterArrears"
              label="En mora"
              value={vm.filterInArrears}
              onChange={vm.setFilterInArrears}
              options={[
                { value: '', label: 'Todos' },
                { value: 'yes', label: 'Sí' },
                { value: 'no', label: 'No' },
              ]}
            />
          </Box>
        </Box>

        <DatatableLocal
          isMobile={isMobile}
          data={vm.members}
          rows={20}
          columns={[
            {
              field: 'memberNumberLabel',
              header: 'Número',
              minWidth: 90,
              filter: true,
              sortable: true,
            },
            {
              field: 'fullName',
              header: 'Nombre',
              minWidth: 180,
              filter: true,
              sortable: true,
            },
            { field: 'firstNames', header: 'Nombres', minWidth: 140, filter: true },
            { field: 'lastNames', header: 'Apellidos', minWidth: 140, filter: true },
            { field: 'documentTypeLabel', header: 'Tipo de documento', minWidth: 150 },
            {
              field: 'documentNumber',
              header: 'Documento',
              minWidth: 130,
              filter: true,
            },
            { field: 'sexLabel', header: 'Sexo', minWidth: 110, filter: true },
            { field: 'mobilePhone', header: 'Celular', minWidth: 130 },
            { field: 'residenceCity', header: 'Ciudad', minWidth: 130 },
            { field: 'profileName', header: 'Perfil', minWidth: 140, filter: true },
            {
              field: 'statusLabel',
              header: 'Estado',
              minWidth: 120,
              filter: true,
              body: (row: MemberRecord) => renderStatus(row.statusLabel),
            },
            {
              field: 'inArrearsLabel',
              header: 'En mora',
              minWidth: 110,
              filter: true,
              body: (row: MemberRecord) => renderStatus(row.inArrearsLabel),
            },
            { field: 'currentFeeLabel', header: 'Cuota vigente', minWidth: 140 },
            { field: 'joinedOnLabel', header: 'Fecha de afiliación', minWidth: 150 },
            { field: 'totalPaidLabel', header: 'Total aportado', minWidth: 140 },
          ]}
          expandedRows={expandedRows}
          onRowToggle={(event) => setExpandedRows(event.data)}
          showExportExcel
          showEditButton={vm.canEdit}
          onEditButtonClick={vm.openEdit}
          tipoViewAcciones="Menu"
          onRowClick={vm.openDetail}
          rowClickTooltip="Ver ficha"
          renderExtraMenuItems={(row: MemberRecord) => (
            <MenuItem
              onClick={(event) => {
                event.stopPropagation();
                window.setTimeout(() => {
                  void vm.openDetail(row);
                }, 0);
              }}
            >
              <ListItemIcon>
                <VisibilityOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Ver ficha
            </MenuItem>
          )}
        />
      </Paper>

      <MemberFormDialog vm={vm} />
      <MemberDetailDrawer vm={vm} />
      <DeliverBenefitDialog vm={vm} />
    </Box>
  );
}
