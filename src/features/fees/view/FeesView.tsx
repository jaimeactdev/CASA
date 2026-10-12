'use client';

import { useState, type ReactElement } from 'react';
import {
  Box,
  ListItemIcon,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes } from '@/styles/designTokens';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import CheckboxFieldMUI from '@/shared/ui/mui/CheckboxFieldMUI';
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';
import InputFieldMUI from '@/shared/ui/mui/InputFieldMUI';
import SelectFieldMUI from '@/shared/ui/mui/SelectFieldMUI';
import SelectWithSearchFieldMUI from '@/shared/ui/mui/SelectWithSearchFieldMUI';
import DatatableLocal from '@/shared/ui/primereact/Datatable/DatatableLocal';
import { StatusIndicator } from '@/shared/ui/StatusIndicatorCell';
import { useFeesViewModel } from '../viewmodel/useFeesViewModel';
import type { FeeRecord } from '../domain/feesTypes';
import PayFeesDialog from './PayFeesDialog';
import RevertFeeDialog from './RevertFeeDialog';

function renderStatus(label: string) {
  if (label === 'Pagado') return <StatusIndicator label={label} positive />;
  if (label === 'Moroso') return <StatusIndicator label={label} positive={false} />;
  return <StatusIndicator label={label} positive={null} />;
}

export default function FeesView() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState<FeeRecord[]>([]);
  const vm = useFeesViewModel();
  const fieldQuarter = { ...theme.customStyleForm.grid3md, display: 'block' };
  const fieldHalf = { ...theme.customStyleForm.grid6md, display: 'block' };
  const showSelection = vm.canPay && vm.allowMulti;

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{ fontSize: fontSizes.xl, fontWeight: 600, color: colors.textPrincipal }}
      >
        Pagos
      </Typography>
      <Typography sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}>
        Cuotas del año. El año se consulta de nuevo; el mes, el estado, el afiliado
        y el medio se filtran aquí. No hay abonos ni meses futuros.
      </Typography>

      {vm.loadError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>{vm.loadError}</Typography>
      ) : null}

      {vm.minimumWage <= 0 ? (
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
            No se generan cuotas nuevas mientras el salario mínimo esté en 0. Las ya
            creadas siguen visibles y se pueden pagar.
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
            Cuotas
          </Typography>
          {showSelection ? (
            <HoverIconButton
              text={
                vm.selectedCount > 0
                  ? `Marcar pagado (${vm.selectedCount})`
                  : 'Marcar pagado'
              }
              type="button"
              onClick={vm.openPaySelection}
              disabled={vm.selectedCount === 0}
              sx={theme.customButtons.primary}
            />
          ) : vm.canPay ? (
            <Typography sx={{ color: colors.textSecondary }}>
              Marca el pago desde la acción de cada cuota.
            </Typography>
          ) : (
            <Typography sx={{ color: colors.textSecondary }}>
              Tu rol solo permite ver las cuotas.
            </Typography>
          )}
        </Box>

        {showSelection ? (
          <Typography sx={{ color: colors.textSecondary, mb: 2, fontSize: fontSizes.sm }}>
            Puedes marcar juntas varias cuotas pendientes o morosas del mismo afiliado.
            {vm.selectionNotice ? ` ${vm.selectionNotice}` : ''}
          </Typography>
        ) : null}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3, mb: 2 }}>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="feeYear"
              label="Año"
              value={vm.year}
              onChange={vm.onChangeYear}
              options={vm.year ? vm.years : [{ value: '', label: 'Cargando…' }]}
              disabled={!vm.year}
            />
          </Box>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="feeMonth"
              label="Mes"
              value={vm.filters.month}
              onChange={vm.setMonth}
              options={vm.monthOptions}
            />
          </Box>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="feeStatus"
              label="Estado"
              value={vm.filters.status}
              onChange={vm.setStatus}
              options={vm.statusOptions}
            />
          </Box>
          <Box sx={fieldHalf}>
            <SelectWithSearchFieldMUI
              name="feeMember"
              label="Afiliado"
              value={vm.filters.memberId}
              onChange={vm.setMemberId}
              options={vm.memberOptions}
            />
          </Box>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="feeMethod"
              label="Medio"
              value={vm.filters.methodId}
              onChange={vm.setMethodId}
              options={vm.methodOptions}
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="feeSearch"
              label="Buscar"
              value={vm.filters.search}
              onChange={(event) => vm.setSearch(event.target.value)}
              smallText="Nombre o número de afiliación."
            />
          </Box>
        </Box>

        <DatatableLocal
          isMobile={isMobile}
          data={vm.fees}
          rows={20}
          columns={[
            {
              field: 'periodLabel',
              header: 'Periodo',
              minWidth: showSelection ? 220 : 150,
              filter: true,
              sortable: true,
              body: (row: FeeRecord) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {showSelection && row.payable ? (
                    <Box
                      onClick={(event) => event.stopPropagation()}
                      data-app-no-row-click
                    >
                      <CheckboxFieldMUI
                        name={`fee-${row.id}`}
                        checked={vm.selectedIds.includes(row.id)}
                        disabled={vm.isFeeLocked(row)}
                        onChange={(checked) => vm.toggleFee(row, checked)}
                        label=""
                      />
                    </Box>
                  ) : null}
                  <span>{row.periodLabel}</span>
                </Box>
              ),
            },
            {
              field: 'memberName',
              header: 'Afiliado',
              minWidth: 180,
              filter: true,
              sortable: true,
            },
            {
              field: 'memberNumberLabel',
              header: 'Número',
              minWidth: 110,
              filter: true,
              sortable: true,
            },
            { field: 'typeLabel', header: 'Tipo', minWidth: 120, filter: true },
            { field: 'baseAmountLabel', header: 'Base', minWidth: 120 },
            { field: 'surchargeLabel', header: 'Recargo', minWidth: 120 },
            { field: 'totalLabel', header: 'Total', minWidth: 130 },
            {
              field: 'statusLabel',
              header: 'Estado',
              minWidth: 130,
              filter: true,
              body: (row: FeeRecord) => renderStatus(row.statusLabel),
            },
            { field: 'dueLimitLabel', header: 'Fecha límite', minWidth: 140 },
            {
              field: 'paymentMethodName',
              header: 'Medio',
              minWidth: 140,
              filter: true,
            },
            { field: 'paidOnLabel', header: 'Fecha de pago', minWidth: 140 },
          ]}
          expandedRows={expandedRows}
          onRowToggle={(event) => setExpandedRows(event.data)}
          showExportExcel
          tipoViewAcciones="Menu"
          renderExtraMenuItems={
            vm.canPay || vm.canRevert
              ? (row: FeeRecord) => {
            const items: ReactElement[] = [];
            if (vm.canPay && row.payable) {
              items.push(
                <MenuItem
                  key="pay"
                  onClick={(event) => {
                    event.stopPropagation();
                    window.setTimeout(() => vm.openPay([row]), 0);
                  }}
                >
                  <ListItemIcon>
                    <CheckCircleOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  Marcar pagado
                </MenuItem>,
              );
            }
            if (vm.canRevert && row.status === 'PAID') {
              items.push(
                <MenuItem
                  key="revert"
                  onClick={(event) => {
                    event.stopPropagation();
                    window.setTimeout(() => vm.openRevert(row), 0);
                  }}
                >
                  <ListItemIcon>
                    <UndoOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  Corregir pago
                </MenuItem>,
              );
            }
            return items;
              }
              : undefined
          }
        />
      </Paper>

      <PayFeesDialog vm={vm} />
      <RevertFeeDialog vm={vm} />
    </Box>
  );
}
