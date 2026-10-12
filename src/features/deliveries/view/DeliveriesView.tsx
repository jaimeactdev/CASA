'use client';

import { useState, type ReactElement } from 'react';
import {
  Box,
  ListItemIcon,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useTheme } from '@mui/material/styles';
import { colors, fontSizes } from '@/styles/designTokens';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import InputFieldMUI from '@/shared/ui/mui/InputFieldMUI';
import SelectFieldMUI from '@/shared/ui/mui/SelectFieldMUI';
import SelectWithSearchFieldMUI from '@/shared/ui/mui/SelectWithSearchFieldMUI';
import DatatableLocal from '@/shared/ui/primereact/Datatable/DatatableLocal';
import { StatusIndicator } from '@/shared/ui/StatusIndicatorCell';
import { useDeliveriesViewModel } from '../viewmodel/useDeliveriesViewModel';
import type { DeliveryRecord } from '../domain/deliveriesTypes';
import VoidDeliveryDialog from './VoidDeliveryDialog';

function renderFlag(label: string, voided: boolean) {
  if (voided && label === 'Sí') {
    return <StatusIndicator label={label} positive={false} />;
  }
  return <StatusIndicator label={label} positive={null} />;
}

export default function DeliveriesView() {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState<DeliveryRecord[]>([]);
  const vm = useDeliveriesViewModel();
  const fieldQuarter = { ...theme.customStyleForm.grid3md, display: 'block' };
  const fieldHalf = { ...theme.customStyleForm.grid6md, display: 'block' };

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        component="h1"
        sx={{ fontSize: fontSizes.xl, fontWeight: 600, color: colors.textPrincipal }}
      >
        Entregas
      </Typography>
      <Typography sx={{ mt: 1, mb: 3, color: colors.textSecondary, maxWidth: 720 }}>
        Entregas del año. El año se consulta de nuevo; el beneficio, el afiliado y
        si está anulada se filtran aquí. Desde la ficha del afiliado se registra
        la entrega.
      </Typography>

      {vm.loadError ? (
        <Typography sx={{ color: colors.error, mb: 2 }}>{vm.loadError}</Typography>
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
            Entregas del año
          </Typography>
          {vm.canVoid ? (
            <Typography sx={{ color: colors.textSecondary }}>
              Anula desde la acción de cada entrega vigente.
            </Typography>
          ) : (
            <Typography sx={{ color: colors.textSecondary }}>
              Tu rol solo permite ver las entregas.
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', rowGap: 3, mb: 2 }}>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="deliveryYear"
              label="Año"
              value={vm.year}
              onChange={vm.onChangeYear}
              options={vm.year ? vm.years : [{ value: '', label: 'Cargando…' }]}
              disabled={!vm.year}
            />
          </Box>
          <Box sx={fieldHalf}>
            <SelectFieldMUI
              name="deliveryBenefit"
              label="Beneficio"
              value={vm.filters.benefitId}
              onChange={vm.setBenefitId}
              options={vm.benefitOptions}
            />
          </Box>
          <Box sx={fieldHalf}>
            <SelectWithSearchFieldMUI
              name="deliveryMember"
              label="Afiliado"
              value={vm.filters.memberId}
              onChange={vm.setMemberId}
              options={vm.memberOptions}
            />
          </Box>
          <Box sx={fieldQuarter}>
            <SelectFieldMUI
              name="deliveryVoided"
              label="Anulada"
              value={vm.filters.voided}
              onChange={vm.setVoided}
              options={vm.voidedOptions}
            />
          </Box>
          <Box sx={fieldHalf}>
            <InputFieldMUI
              name="deliverySearch"
              label="Buscar"
              value={vm.filters.search}
              onChange={(event) => vm.setSearch(event.target.value)}
              smallText="Nombre, número o beneficio."
            />
          </Box>
        </Box>

        <DatatableLocal
          isMobile={isMobile}
          data={vm.deliveries}
          rows={20}
          columns={[
            {
              field: 'memberNumberLabel',
              header: 'Número',
              minWidth: 110,
              filter: true,
              sortable: true,
            },
            {
              field: 'memberName',
              header: 'Nombre',
              minWidth: 180,
              filter: true,
              sortable: true,
            },
            {
              field: 'benefitName',
              header: 'Beneficio',
              minWidth: 180,
              filter: true,
              sortable: true,
            },
            { field: 'year', header: 'Año', minWidth: 90, sortable: true },
            {
              field: 'deliveredOnLabel',
              header: 'Fecha',
              minWidth: 130,
              sortable: true,
            },
            {
              field: 'exceptionLabel',
              header: 'Excepción',
              minWidth: 130,
              body: (row: DeliveryRecord) => renderFlag(row.exceptionLabel, false),
            },
            {
              field: 'voidedLabel',
              header: 'Anulada',
              minWidth: 130,
              body: (row: DeliveryRecord) => renderFlag(row.voidedLabel, true),
            },
            {
              field: 'deliveredByName',
              header: 'Entregó',
              minWidth: 160,
              filter: true,
              sortable: true,
            },
            { field: 'note', header: 'Nota', minWidth: 180 },
          ]}
          expandedRows={expandedRows}
          onRowToggle={(event) => setExpandedRows(event.data)}
          showExportExcel
          tipoViewAcciones="Menu"
          renderExtraMenuItems={
            vm.canVoid
              ? (row: DeliveryRecord) => {
                  const items: ReactElement[] = [];
                  if (!row.isVoided) {
                    items.push(
                      <MenuItem
                        key="void"
                        onClick={(event) => {
                          event.stopPropagation();
                          window.setTimeout(() => vm.openVoid(row), 0);
                        }}
                      >
                        <ListItemIcon>
                          <BlockOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        Anular
                      </MenuItem>,
                    );
                  }
                  return items;
                }
              : undefined
          }
        />
      </Paper>

      <VoidDeliveryDialog vm={vm} />
    </Box>
  );
}
